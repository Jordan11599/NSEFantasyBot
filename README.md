# NSEFantasyBot v2.0.0

CS:GO Fantasy Bot for NSE.

A node.js library for parsing Counter-Strike Global Offensive (CSGO) demo files.
This library is inspired by numerous contributions. For more details, please view reference links below.

> ⚠️ This library requires Node v14 or later.

## Getting Started

Once downloaded, find the path and run:
```bash
.../NSEFantasyBot$ npm i
.../NSEFantasyBot$ cd Main
.../NSEFantasyBot/Main$ npm i
```
To get started, add your own folders, demos/ and DemoFolder/ to add your .dem files to:
```bash
.../NSEFantasyBot/demos/DemoFolder/
```
To extract data from .dem files:
```bash
.../NSEFantasyBot/Main$ npx ts-node dumpfile.ts
```

## SQL Output

Each .dem file will create a .txt file as a log inside of .../NSEFantasyBot/demos/DemoFolder/ as they run on individual threads

```bash
.../NSEFantasyBot/Main$ npx ts-node dumpfile.ts
connection successful
file was not found!
Game has ended
Finished.
{
  Steam64Id: '76561197995988926',
  Name: 'kris',
  TotalKills: 23,
  TotalAssists: 1,
  TotalDeaths: 11,
  TotalMVP: 2,
  TotalMaps: 1,
  Headshots: 13,
  EntryKills: 6,
  Damage: 2241,
  Rounds: 21,
  Wins: 1
}
//[repeats for all other players]
```

#### Reference Links
- [Original Github Repository (Saul Rennison)](https://github.com/saul/demofile)
- [CS:GO Game Events - AlliedModders Wiki](https://wiki.alliedmods.net/Counter-Strike:_Global_Offensive_Events)

