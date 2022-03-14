const sqlite3 = require("sqlite3").verbose();
var db = null;

//createDataBase("NSEdatabase");
export function openSQL() {
  db = new sqlite3.Database("./NSEdatabase.db", sqlite3.OPEN_READWRITE, err => {
    if (err) return console.error(err.message);

    console.log("connection successful");
  });

  db.run(
    "CREATE TABLE IF NOT EXISTS players(Steam64Id PRIMARY KEY, Name, TotalKills, TotalAssists, TotalDeaths, TotalMVP, TotalMaps, Headshots, EntryKills, Damage, Rounds, Wins)"
  );
  err => {
    if (err) return console.error(err.message);
  };

  db.run("CREATE TABLE IF NOT EXISTS files(FileName PRIMARY KEY)");
  err => {
    if (err) return console.error(err.message);
  };
}

export function fileFound(e) {
  return new Promise((resolve, reject) => {
    let sqlFileFound = "SELECT * FROM files where FileName = ?";
    db.all(sqlFileFound, [e], (err, rows) => {
      if (err) return reject(err);

      if (rows.length > 0) {
        resolve(true);
      } else {
        db.run(`REPLACE INTO files (FileName) VALUES ('${e}')`);
        resolve(false);
      }
    });
  });
}

export function profileCreate(players, informationArray) {
  players.forEach(async e => {
    if (e.teamNumber === 2 || e.teamNumber === 3) {
      let p = await profileGet(e);
      let nameClean = e.name.replace("'", "''");
      let playerStats = informationArray.get(`${e.steam64Id}`);

      db.run(
        `REPLACE INTO players (Steam64Id, Name, TotalKills, TotalAssists, TotalDeaths, TotalMVP, TotalMaps, Headshots, EntryKills, Damage, Rounds, Wins)
        VALUES ('${e.steam64Id}',
        '${nameClean}',
         ${p.TotalKills + e.kills},
         ${p.TotalAssists + e.assists},
         ${p.TotalDeaths + e.deaths},
         ${p.TotalMVP + e.mvps},
         ${p.TotalMaps + 1},
         ${p.Headshots + playerStats.headshots},
         ${p.EntryKills + playerStats.entrykills},
         ${p.Damage + playerStats.damage},
         ${p.Rounds + playerStats.rounds},
         ${p.Wins + playerStats.wins})`
      );
    }
  });

  // informationArray.forEach(element => {
  //   // console.log(`works: ${Object.values(element)}`);
  //   console.log(element.headshots);
  // });

  // console.log(`works: ${Object.values(informationArray)}`);
}

export function profileGet(player) {
  var query = `SELECT * FROM players WHERE Steam64Id = '${player.steam64Id}'`;
  return new Promise((resolve, reject) => {
    db.all(query, function (err, rows) {
      if (err) {
        reject(err);
      }
      if (rows.length > 0) {
        resolve(rows[0]);
      } else {
        resolve({
          Steam64Id: player.steam64Id,
          Name: player.name,
          TotalKills: 0,
          TotalAssists: 0,
          TotalDeaths: 0,
          TotalMVP: 0,
          TotalMaps: 0,
          Headshots: 0,
          EntryKills: 0,
          Damage: 0,
          Rounds: 0,
          Wins: 0
        });
      }
    });
  });
}

// /**
//  *
//  * @param {Player} players
//  */
// export async function profileCreate(players) {
//   await players.forEach(async e => {
//     if (e.teamNumber === 2 || e.teamNumber === 3) {
//       var sqlExists = `SELECT * FROM players WHERE Steam64Id = '${e.steam64Id}'`;
//       await db.all(sqlExists, [], async (err, rows) => {
//         if (err) return console.error(err.message);

//         if (rows.length === 0) {
//           await db.run(
//             "INSERT INTO players (Steam64Id, Name, TotalKills, TotalAssists, TotalDeaths, TotalMVP, TotalMaps) VALUES(?,?,?,?,?,?,?)",
//             [e.steam64Id, e.name, e.kills, e.assists, e.deaths, e.mvps, 1],
//             err => {
//               if (err) {
//                 console.log("this is an error lol");
//                 return console.error(err.message);
//               }

//               console.log("a new row has been created");
//             }
//           );
//         } else {
//           const newName = e.name;
//           const newKills = rows[0].TotalKills + e.kills;
//           const newAssists = rows[0].TotalAssists + e.assists;
//           const newDeaths = rows[0].TotalDeaths + e.deaths;
//           const newMVP = rows[0].TotalMVP + e.mvps;
//           const newMaps = rows[0].TotalMaps + 1;

//           await db.run(
//             `UPDATE players SET
//             Name = '${newName}',
//             TotalKills = ${newKills},
//             TotalAssists = ${newAssists},
//             TotalDeaths = ${newDeaths},
//             TotalMVP = ${newMVP},
//             TotalMaps = ${newMaps}
//             WHERE Steam64Id = '${e.steam64Id}'`
//           );
//           // await db.run(
//           //   `UPDATE players SET TotalKills = ${newKills} WHERE Steam64Id = '${e.steam64Id}'`
//           // );
//         }
//       });
//     }
//   });
// }

//----------------------------------------------------------------------------------------------------------------------
//creating the table
// db.run(
//   "CREATE TABLE users(first_name, last_name, username, password, email, id)"
// );

//creating the rows
// const sql =
//   "INSERT INTO users (first_name, last_name, username, password, email, id) VALUES(?,?,?,?,?,?)";

//adding the data into those rows
// db.run(
//   sql,
//   ["mike", "codes", "mike_codes", "123", "mikecodes@gmail.com", 1],
//   err => {
//     if (err) return console.error(err.message);

//     console.log("a new row has been created");
//   }
// );

//reading the rows
//----------------------------------------------------------------------------------------------------------------------
export function createDataBase(name) {
  new sqlite3.Database(`${name}.db`);
  console.log(`successfully created new database called ${name}`);
}

export function printDataBase() {
  const sqlRead = "SELECT * FROM players";

  db.all(sqlRead, [], (err, rows) => {
    if (err) return console.error(err.message);

    rows.forEach(row => {
      console.log(row);
    });

    close();
  });
}

function close() {
  db.close(err => {
    if (err) return console.error(err.message);
  });
  console.log("db closed");
}
