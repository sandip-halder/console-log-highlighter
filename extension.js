"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let isActive = true;
const decorationTypes = {};
function getDecorationTypes() {
    const methods = vscode.workspace
        .getConfiguration()
        .get("consoleLogHighlighter.methods", [
        "log",
        "error",
        "warn",
        "info",
    ]);
    const highlightColors = vscode.workspace
        .getConfiguration()
        .get("consoleLogHighlighter.highlightColors", {
        log: "rgba(255,255,0,0.2)",
        error: "rgba(255, 99, 71, 1)",
        warn: "rgba(246, 156, 0, 0.8)",
        info: "rgba(0,0,255,0.2)",
    });
    methods.forEach((method) => {
        decorationTypes[method] = vscode.window.createTextEditorDecorationType({
            backgroundColor: highlightColors[method] || "rgba(255,255,0,0.2)",
            color: "inherit",
        });
    });
}
function updateDecorations(editor) {
    if (!editor || !isActive) {
        return;
    }
    Object.keys(decorationTypes).forEach((method) => {
        const regEx = new RegExp(`console\\.${method}\\([^)]*\\)`, "g");
        const text = editor.document.getText();
        const decorations = [];
        let match;
        while ((match = regEx.exec(text))) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos) };
            decorations.push(decoration);
        }
        editor.setDecorations(decorationTypes[method], decorations);
    });
}
function activate(context) {
    getDecorationTypes();
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        updateDecorations(activeEditor);
    }
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("consoleLogHighlighter")) {
            Object.values(decorationTypes).forEach((decorationType) => decorationType.dispose());
            getDecorationTypes();
            if (activeEditor) {
                updateDecorations(activeEditor);
            }
        }
    });
    const toggleCommand = vscode.commands.registerCommand("consoleLogHighlighter.toggle", () => {
        isActive = !isActive;
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (isActive) {
                updateDecorations(editor);
            }
            else {
                Object.values(decorationTypes).forEach((decorationType) => editor.setDecorations(decorationType, []));
            }
        }
    });
    context.subscriptions.push(toggleCommand);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map