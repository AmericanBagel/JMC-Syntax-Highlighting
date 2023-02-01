import * as fs from "fs";

export const KEYWORDS: Array<string> = [
	"function",
	"new",
	"if",
	"else",
	"while",
	"for",
	"do",
	"switch",
	"case",
];

export const VANILLA_COMMANDS: Array<string> = [
	"advancement",
	"attribute",
	"bossbar",
	"clear",
	"clear",
	"clone",
	"data",
	"datapack",
	"defaultgamemode",
	"difficulty",
	"effect",
	"enchant",
	"execute",
	"experience",
	"fill",
	"fillbiome",
	"foceload",
	"function",
	"gamemode",
	"gamerule",
	"give",
	"item",
	"kill",
	"loot",
	"me",
	"msg",
	"particle",
	"place",
	"playsound",
	"recipe",
	"say",
	"schedule",
	"scoreboard",
	"setblock",
	"spawnpoint",
	"setidletimeout",
	"setworldspawn",
	"spectate",
	"spreadplayers",
	"stopsound",
	"summon",
	"tag",
	"team",
	"teammsg",
	"teleport",
	"tell",
	"tellraw",
	"time",
	"title",
	"tm",
	"tp",
	"trigger",
	"weather",
	"worldborder",
	"xp",
];

export const HEADERS: Array<string> = [
	"define",
	"credit",
	"include",
	"command",
	"override_minecraft",
	"static",
];

export const JSON_FILE_TYPES = [
	"advancements",
	"dimension",
	"dimension_type",
	"loot_tables",
	"predicates",
	"recipes",
	"item_modifiers",
	"structures",
	"worldgen/biome",
	"worldgen/configured_carver",
	"worldgen/configured_feature",
	"worldgen/configured_structure_feature",
	"worldgen/configured_surface_builder",
	"worldgen/noise_settings",
	"worldgen/processor_list",
	"worldgen/template_pool",
];

export interface TextLinePos {
	line: number;
	length: number;
}

export function getLineByIndex(
	index: number,
	linepos: TextLinePos[]
): { line: number; pos: number } {
	for (let i of linepos) {
		if (index < i.length) {
			return { line: i.line, pos: index };
		}
		index -= i.length;
	}
	return { line: -1, pos: -1 };
}

export function getLinePos(text: string): TextLinePos[] {
	let textLinePos: TextLinePos[] = [];
	let textLines = text.split("\n");
	for (let i = 0; i < textLines.length; i++) {
		let textLine = textLines[i];
		textLinePos.push({
			line: i,
			length: textLine.length + 1,
		});
	}
	return textLinePos;
}

export function getImport(text: string): string[] {
	let importPattern = /@import\s*\"(.+)\"/g;
	let m: RegExpExecArray | null;
	let files: string[] = [];

	while ((m = importPattern.exec(text)) !== null) {
		files.push(`${m[1]}.jmc`);
	}
	return files;
}

export function getDocumentText(
	path: string,
	root: string | undefined
): string {
	let text: string = "";
	fs.readFile(`${root}/${path}`, "utf-8", (err, data) => {
		if (err !== null) {
			console.log(err);
		} else {
			text = data;
		}
	});
	return text;
}

export interface ImportData {
	filename: string;
	text: string;
}

export function getImportDocumentText(
	text: string,
	root: string | undefined
): ImportData[] {
	let datas: ImportData[] = [];

	let files = getImport(text);
	for (let file of files) {
		let text = getDocumentText(file, root);
		datas.push({
			filename: file,
			text: text,
		});
	}
	return datas;
}

export function getCurrentFolder(path: string): string {
	let edited = path.split("\\");
	edited.pop();
	return edited.join("\\");
}

export function getVariables(text: string, root: string): string[] {
	let definedVariables: string[] = [];

	let variablePattern = /\$(\w+)\s*\??=(?!=)/g;
	let m: RegExpExecArray | null;

	let files = getImportDocumentText(text, root);
	files.push({
		filename: "main",
		text: text,
	});

	for (let i of files) {
		let text = i.text;
		while ((m = variablePattern.exec(text)) !== null) {
			definedVariables.push(m[1]);
		}
	}

	return definedVariables;
}

export function getUnusedVariables(
	text: string,
	root: string | undefined
): string[] {
	let variables: string[] = [];

	let variablePattern = /\$([\w\.]+)/g;
	let m: RegExpExecArray | null;

	let files = getImportDocumentText(text, root);
	files.push({
		filename: "main",
		text: text,
	});

	for (let i of files) {
		let text = i.text;
		while ((m = variablePattern.exec(text)) !== null) {
			if (m[1].endsWith(".get")) {
				variables.push(m[1].slice(0, -4));
			} else {
				variables.push(m[1]);
			}
		}
	}

	let nonDuplicate = variables.filter((item, index) => {
		variables.splice(index, 1);
		const unique = !variables.includes(item) && !item.endsWith(".get");
		variables.splice(index, 0, item);
		return unique;
	});

	return nonDuplicate;
}
export function getTextByLine(text: string, line: number): string {
	return text.split("\n")[line];
}

export function getFunctions(text: string, root: string): string[] {
	let definedFunctions: string[] = [];

	let functionPattern = /function\s*([\w\.]+)\(/g;
	let m: RegExpExecArray | null;

	let files = getImportDocumentText(text, root);
	files.push({
		filename: "main",
		text: text,
	});

	for (let i of files) {
		let text = i.text;
		while ((m = functionPattern.exec(text)) !== null) {
			definedFunctions.push(m[1]);
		}
	}

	return definedFunctions;
}
