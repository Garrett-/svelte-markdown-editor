const fs = require('fs'); // File System module
const rq = require('electron-require'); // easy electron require module
const showdown = require('showdown'); // Markdown converter module
const converter = new showdown.Converter();
const pack = rq('./package.json');
const {remote, ipcRenderer} = require('electron');

// ///////////////////////////////
// Svelte Components
const MarkdownEditor = rq('./components/MarkdownEditor.js');
const MarkdownView = rq('./components/MarkdownView.js');
const Footer = rq('./components/Footer.js');

/**
 * Wait for the DOM to be ready before we start inserting
 * the Svelte components
 */
document.addEventListener('DOMContentLoaded', function () {

  /**
   * The Footer element contains the save buttons
   * @type {Footer}
   */
  var footer = new Footer({
    target: document.getElementById('footer')
  });

  /**
   * The markdown editor this is the main input
   * that the user types into
   * @type {MarkdownEditor}
   */
  var markdownEditor = new MarkdownEditor({
    target: document.getElementById('md-editor'),
  });

  /**
   * Renders the HTML converted from the markdown editor
   * @type {MarkdownView}
   */
  var markdownView = new MarkdownView({
    target: document.getElementById('md-view'),
  });

  /** ************************************************
   * EVENT LISTENERS
   ************************************************ */

  /**
   * When the user changes the contents of the editor
   * by typing this event is fired on key up
   * @type {showdown}
   */
  markdownEditor.on('changed', function({ value }){
    const html = converter.makeHtml(value);

    if(html) {
      markdownView.set({ html });
    }
  });

  /**
   * When the user clicks a save button this method is fired
   *
   * depending on the `type` sent this will save an HTML (html) / Markdown (md) file
   * @type {Object}
   */
  footer.on('save', function({ type }) {
    const {dialog} = remote;
    const dialogOptions = {
      defaultPath: `~/untitled.${type}`
    };
    const html = markdownView.get('html');
    const markdown = markdownEditor.get('value');

    // Shows the native file save dialog of the users OS
    dialog.showSaveDialog(remote.getCurrentWindow(), dialogOptions, function(filename) {
      if(filename) {
        footer.set({saving: true});

        // Write the file to the user file system
        fs.writeFile(filename, (type==='html'?html:markdown), (err) => {
          if(err) { dialog.showErrorBox('Failed to save file', err.message); }
          footer.set({saving: false});
        });
      }
    });
  });

  /**
   * Triggerd when the user selects `Open Markdown` from the file dropdown menu
   *
   * File > Open Markdown
   * @type {Object}
   */
  ipcRenderer.on('open-markdown', function() {
    const {dialog} = remote;
    const dialogOptions = {
      filters: [ // Limit the file selection to only markdown files
        {name: 'Markdown', extensions: ['md', 'markdown']}
      ]
    };

    // Opens native OS file selection window
    dialog.showOpenDialog(remote.getCurrentWindow(), dialogOptions, function([ filePath ]) {

      // Read file contents from the users file system
      fs.readFile(filePath, 'utf8', (err, data) => {
        if(err) { dialog.showErrorBox('Failed to open file', err.message); }
        if(data) {
          markdownEditor.set({value: data});
          markdownEditor.fire('changed', {value: data});
        }
      });
    });
  });

});
