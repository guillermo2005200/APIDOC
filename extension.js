const vscode = require('vscode');
const llamarGemini = require('./gemini');
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand('apidoc.leerarchivo', async () => {
    // 1. Buscar archivos del proyecto
    const files = await vscode.workspace.findFiles('**/*');
    if (files.length === 0) {
      vscode.window.showWarningMessage('No se encontraron archivos en el proyecto.');
      return;
    }

    // 2. QuickPick para seleccionar
    const items = files.map(f => ({
      label: vscode.workspace.asRelativePath(f),
      uri: f
    }));

    const seleccionado = await vscode.window.showQuickPick(items, {
      placeHolder: 'Selecciona un archivo del proyecto'
    });

    let content = '';
    if (seleccionado) {
      // 3. Leer el contenido
      const fileData = await vscode.workspace.fs.readFile(seleccionado.uri);
      content = Buffer.from(fileData).toString('utf8');
    } else {
      vscode.window.showWarningMessage('No seleccionaste ningún archivo.');
      return;
    }

    // 4. Llamada a Gemini
    const resultado = await llamarGemini(content);

    if (resultado) {
      // 5. Mostrar el resultado en un Webview
      const panel = vscode.window.createWebviewPanel(
        'apidocResult',
        'Resultado de Gemini',
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = `<html><body><pre>${resultado}</pre></body></html>`;

      // 6. Guardar el resultado en un archivo .txt en la raíz del workspace
      if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const folderUri = vscode.workspace.workspaceFolders[0].uri;
        const fileUri = vscode.Uri.joinPath(folderUri, 'resultado-gemini.txt');
        await vscode.workspace.fs.writeFile(fileUri, Buffer.from(resultado, 'utf8'));
        vscode.window.showInformationMessage('Resultado guardado en resultado-gemini.txt');
      } else {
        vscode.window.showWarningMessage('No se encontró la carpeta del workspace para guardar el archivo.');
      }
    } else {
      vscode.window.showErrorMessage('No se pudo obtener una respuesta de Gemini.');
    }
  });

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
