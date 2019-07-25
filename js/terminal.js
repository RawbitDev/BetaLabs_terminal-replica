// Pause the javascript execution for a specific time
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s*1000));
  }

// Print something to the terminal
function printRawTerminal(text) {
    document.getElementById('terminalWindow').innerHTML += "<span>" + text + "</span>";
}

// Print something to the terminal and add a line break at the end
function printT(text) {
    printRawTerminal(text + "<br \>");
}

// Get an input of the user
function getInput() {
    printRawTerminal("root@BetaLabs.io:~# ");
    printRawTerminal("<textarea id='textarea' rows='1'></textarea>");
    document.getElementById('textarea').focus();
}

// Initialize the terminal
async function init() {
    printT("Welcome!");
    await sleep(1);
    getInput();
}
init();