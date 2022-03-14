/* eslint-disable no-console */

// This file is an thorough example of how to log player kills,
// team scores, chat text and server cvar changes from a demo file.

import * as ansiStyles from "ansi-styles";
import * as fs from "fs";
import * as util from "util";
import { DemoFile, Player, Team, TeamNumber } from "demofile";
import { textChangeRangeIsUnchanged } from "typescript";
import {
  profileCreate,
  openSQL,
  printDataBase,
  fileFound
} from "./SQLDataBase";

openSQL();

async function parseDemoFile(path: string) {
  await sleep(2000); //Needed so db can create tables before Read/Write on first run
  const stream = fs.createReadStream(path);

  //creates file if it doesn't exist in a txt log
  fs.createWriteStream(path.replace(".dem", ".txt"));
  const pathReplace = path.replace(".dem", ".txt");

  const demoFile = new DemoFile();
  const informationArray = new Map();
  let fooX: any | undefined = "";

  if (await fileFound(path)) {
    console.log("file was found!");
    //return;
  }
  console.log("file was not found!");

  demoFile.gameEvents.on("round_announce_match_start", e => {
    const players = demoFile.entities.players;

    players.forEach(player => {
      if (player.teamNumber === 2 || player.teamNumber === 3) {
        informationArray.set(player.steam64Id, {
          steam64Id: player.steam64Id,
          name: player.name,
          headshots: 0,
          entrykills: 0,
          damage: 0,
          rounds: 0,
          wins: 0
        });
      }
    });
  });

  demoFile.gameEvents.on("round_start", rs => {
    const players = demoFile.entities.players;

    let found = false;

    let TScore = demoFile.teams[TeamNumber.Terrorists]!.score;
    let CTScore = demoFile.teams[TeamNumber.CounterTerrorists]!.score;
    let totalScore = TScore + CTScore;
    //console.log(demoFile.currentTime);
    //console.log(totalScore);
    //console.log(rs.timelimit);

    demoFile.gameEvents.on("player_death", function Death(pd) {
      //ignores, bombplant kills, suicides, knife rounds and warmu
      if (
        rs.timelimit === 999 ||
        pd.weapon === "world" ||
        pd.weapon === "worldspawn" ||
        pd.weapon === "c4_planted" ||
        pd.weapon === "knife_push" ||
        pd.weapon === "knife_t" ||
        pd.weapon === "knife" ||
        pd.weapon === "knife_flip" ||
        pd.weapon === "knife_css" ||
        pd.weapon === "knife_stiletto" ||
        pd.weapon === "bayonet" ||
        pd.weapon === "knife_widowmaker" ||
        pd.weapon === "knife_gypsy_jackknife" ||
        pd.weapon === "knife_survival_bowie" ||
        pd.weapon === "knife_cord" ||
        pd.weapon === "knife_butterfly" ||
        pd.weapon === "knife_falchion" ||
        pd.weapon === "knife_gut" ||
        pd.weapon === "knife_tactical" ||
        pd.weapon === "knife_karambit" ||
        pd.weapon === "knife_m9_bayonet" ||
        pd.weapon === "knife_outdoor" ||
        pd.weapon === "knife_skeleton" ||
        pd.weapon === "knife_canis" ||
        pd.weapon === "knife_ursus"
      ) {
        found = true;
        return;
      } else if (!found) {
        const pos = pd.attackerEntity?.position;

        if (pos?.x != fooX) {
          fooX = pos?.x;

          informationArray.forEach(element => {
            if (element.steam64Id === pd.attackerEntity?.steam64Id) {
              element.entrykills = element.entrykills + 1;
            }
          });

          found = true;
        } else {
          found = true;
          return;
        }
      }
      demoFile.gameEvents.removeListener("player_death", Death);
      return;
    });
  });

  demoFile.gameEvents.on("player_death", e => {
    if (e.headshot) {
      informationArray.forEach(element => {
        if (element.steam64Id === e.attackerEntity?.steam64Id) {
          element.headshots = element.headshots + 1;
        }
      });
    }
  });

  function sleep(ms: any) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function sendToSQL() {
    const players = demoFile.entities.players;

    await profileCreate(players, informationArray);

    await sleep(2000);

    printDataBase();

    //console.log(informationArray);
  }

  demoFile.gameEvents.on("cs_win_panel_match", e => {
    console.log("Game has ended");

    const players = demoFile.entities.players;
    const teams = demoFile.teams;
    const terrorists = teams[TeamNumber.Terrorists]!;
    const cts = teams[TeamNumber.CounterTerrorists]!;

    players.forEach(p => {
      p.matchStats.forEach(ms => {
        informationArray.forEach(element => {
          if (element.steam64Id === p.steam64Id) {
            element.damage = element.damage + ms.damage;
          }
        });
      });
    });

    informationArray.forEach(element => {
      element.rounds = cts.score + terrorists.score + 1;
    });

    let CTWinner = cts.score > terrorists.score;

    players.forEach(p => {
      let stats = informationArray.get(p.steam64Id);
      if (p.teamNumber === 2) {
        if (!CTWinner) {
          stats.wins = 1;
        }
      }
      if (p.teamNumber === 3) {
        if (CTWinner) {
          stats.wins = 1;
        }
      }
    });

    sendToSQL();
  });

  function logTeamScores() {
    const teams = demoFile.teams;
    const terrorists = teams[TeamNumber.Terrorists]!;
    const cts = teams[TeamNumber.CounterTerrorists]!;

    const data = `\t${terrorists.teamName}: ${terrorists.clanName} score ${terrorists.score}\n\t${cts.teamName}: ${cts.clanName} score ${cts.score}\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  }

  // function formatSayText(entityIndex: number, text: string) {
  //   text = "\x01" + text;

  //   // If we have an entity index set, colour 0x03 in that entity's team colour
  //   if (entityIndex > 0) {
  //     const ent = demoFile.entities.entities.get(entityIndex);
  //     if (ent instanceof Player) {
  //       text = text.replace(/\x03/g, teamNumberToAnsi(ent.teamNumber));
  //     }
  //   }

  //   // Replace each colour code with its corresponding ANSI escape sequence
  //   for (const r of colourReplacements) {
  //     text = text.replace(r.pattern, ansiStyles.reset.open + r.ansi);
  //   }

  //   return text + ansiStyles.reset.open;
  // }

  demoFile.on("start", () => {
    //console.log("Demo server name:", demoFile.header.serverName);
    const data = `Demo server name: ${demoFile.header.serverName}\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  });

  demoFile.gameEvents.on("round_officially_ended", e => {
    logTeamScores();
  });

  demoFile.on("end", async e => {
    if (e.error) {
      console.error("Error during parsing:", e.error);
    } else {
      logTeamScores();
      //console.log(informationArray);
    }

    console.log("Finished.");
  });

  demoFile.conVars.on("change", e => {
    //console.log("%s: %s -> %s", e.name, e.oldValue, e.value);
    const data = `${e.name}: ${e.oldValue} -> ${e.value}\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  });

  demoFile.gameEvents.on("player_death", e => {
    const victim = demoFile.entities.getByUserId(e.userid);
    // const victimColour = teamNumberToAnsi(
    //   victim ? victim.teamNumber : TeamNumber.Spectator
    // );
    const victimName = victim ? victim.name : "unnamed";

    const attacker = demoFile.entities.getByUserId(e.attacker);
    // const attackerColour = teamNumberToAnsi(
    //   attacker ? attacker.teamNumber : TeamNumber.Spectator
    // );

    const attackerName = attacker ? attacker.name : "unnamed";

    const headshotText = e.headshot ? " HS" : "";

    const data = `Team ${attacker?.teamNumber} ${attackerName} [${e.weapon}${headshotText}] Team ${victim?.teamNumber} ${victimName}\n`;

    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  });

  // demoFile.userMessages.on("TextMsg", e => {
  //   const params = e.params
  //     .map(param =>
  //       param[0] === "#" ? standardMessages[param.substring(1)] || param : param
  //     )
  //     .filter(s => s.length) as [string, ...string[]];

  //   const formatted = util.format.apply(null, params);
  //   console.log(formatSayText(0, formatted));

  //   // const data = formatSayText(0, formatted);
  //   // fs.appendFile(pathReplace, data, error => {
  //   //   if (error) throw error;
  //   // });
  // });

  // demoFile.userMessages.on("SayText", e => {
  //   console.log(formatSayText(0, e.text));
  // });

  // demoFile.userMessages.on("SayText2", e => {
  //   const nonEmptyParams = e.params.filter(s => s.length);
  //   const msgText = standardMessages[e.msgName];
  //   const formatted = msgText
  //     ? util.format.apply(null, [msgText, ...nonEmptyParams])
  //     : `${e.msgName} ${nonEmptyParams.join(" ")}`;

  //   console.log(formatSayText(e.entIdx, formatted));
  // });

  demoFile.gameEvents.on("round_end", e => {
    // console.log(
    //   "*** Round ended '%s' (reason: %s, tick: %d, time: %d secs)",
    //   demoFile.gameRules.phase,
    //   e.reason,
    //   demoFile.currentTick,
    //   demoFile.currentTime | 0
    // );

    const data = `*** Round ended '${demoFile.gameRules.phase}' (reason: ${e.reason}, tick: ${demoFile.currentTick}, time: ${demoFile.currentTime} secs)\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });

    // We can't print the team scores here as they haven't been updated yet.
    // See round_officially_ended below.
  });

  demoFile.entities.on("create", e => {
    // We're only interested in player entities being created.
    if (!(e.entity instanceof Player)) {
      return;
    }

    const data = `${e.entity.name} (${e.entity.steamId}) joined the game\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  });

  demoFile.entities.on("beforeremove", e => {
    if (!(e.entity instanceof Player)) {
      return;
    }

    const data = `${e.entity.name} left the game\n`;
    fs.appendFile(pathReplace, data, error => {
      if (error) throw error;
    });
  });

  // Start parsing the stream now that we've added our event listeners
  demoFile.parseStream(stream);
}

const files = fs.readdirSync("../demos/DemoFolder");

files.forEach(element => {
  const dir = element.split(".").pop();
  if (dir === "dem") {
    parseDemoFile(`../demos/DemoFolder/${element}`);
  }
});
