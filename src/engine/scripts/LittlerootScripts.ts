const messages:Record<string,string[]>={
 LittlerootTown_EventScript_TownSign:["LITTLEROOT TOWN\n“A town that can't be shaded any hue.”"],
 LittlerootTown_EventScript_BirchsLabSign:["PROF. BIRCH'S POKéMON LAB"],
 LittlerootTown_EventScript_BrendansHouseSign:["PLAYER's HOUSE"],
 LittlerootTown_EventScript_MaysHouseSign:["PROF. BIRCH'S HOUSE"],
 LittlerootTown_EventScript_Twin:["Um, um, um!","If you go outside and go in the grass,\nwild POKéMON will jump out!"],
 LittlerootTown_EventScript_Boy:["PROF. BIRCH spends days in his LAB\nstudying, then he'll suddenly go out in\nthe wild to do more research…","When does PROF. BIRCH spend time\nat home?"],
 LittlerootTown_EventScript_FatMan:["If you use a PC, you can store items\nand POKéMON.","The power of science is staggering!"]
};
/** First executable script slice, transcribed from data/maps/LittlerootTown/scripts.inc. */
export function dialogueFor(script:string){return messages[script]??null;}
