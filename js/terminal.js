// Pause the javascript execution for a specific time
function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

//Move the cursor to pos
function setCursorPosition(input, pos) {
    // Modern browsers
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(pos, pos);

        // IE8 and below
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd("character", pos);
        range.moveStart("character", pos);
        range.select();
    }
}

// Print raw stuff to the terminal
function printRawTerminal(text) {
    document.getElementById("cursor").insertAdjacentHTML("beforebegin", text);
    document.getElementById("terminal").scrollTop = document.getElementById("terminal").scrollHeight;
}

// Print something to the terminal
function printT(text) {
    printRawTerminal("<br /><div>" + text + "</div>");
}
async function waitT(char, count, s) {
    for (var i=0; i<count; i++) {
        printRawTerminal("<div>" + char + "</div>");
        await sleep(s);
    }
}

// Get an input of the user
function getInput(br=true) {
    if (br) {
        printT("root@BetaLabs.io:~# ");
    } else {
        printRawTerminal("<div>root@BetaLabs.io:~# </div>");
    }
    printRawTerminal("<div></div>");
    var input = document.getElementById("input");
    input.value = "";
    input.addEventListener("keyup", inputHandler);
    input.focus();
}

// Event handler for blinking cursor
var blink = false;
async function cursorHandler(event) {
    event.preventDefault();
    var cursor = document.getElementById("cursor");
    if (event.type == "blur") {
        cursor.hidden = false;
        blink = false;
    } else {
        blink = true;
    }
    while (blink == true) {
        cursor.hidden = true;
        await sleep(0.5);
        cursor.hidden = false;
        await sleep(0.5);
    }
}

// Event handler for the input
function inputHandler(event) {
    event.preventDefault();
    var input = document.getElementById("input");
    setCursorPosition(input, input.value.length);
    var inputText = input.value.replace(/<|>/gi, "");
    input.value = inputText;
    if (event.keyCode === 13) {
        input.removeEventListener("keyup", inputHandler);
        runCommand(input.value);
    } else {
        document.getElementById("cursor").previousElementSibling.innerHTML = input.value;
        //document.getElementById("cursor").parentElement.innerHTML = "<div>" + input.value + "</div><div id='cursor'></div>";
    }
}

// Event handler terminal focus
function terminalHandler() {
    document.getElementById("input").focus();
}

// Read a linked file
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
     xmlhttp.send();
    if (xmlhttp.status === 200) {
        result = xmlhttp.responseText;
    }
    return result;
}

// Initialize the terminal
var terminalDefaultContent;
function init() {
    terminalDefaultContent = document.getElementById("terminal").innerHTML;
    var input = document.getElementById("input");
    input.addEventListener("focus", cursorHandler);
    input.addEventListener("blur", cursorHandler);
    document.getElementById("terminal").addEventListener("click", terminalHandler);
    input.focus();
}

// Startup message
async function startup() {
    await sleep(2);
    printRawTerminal("<div>BetaLabsOS [Version 1.0.0] (c) 2019 MrRawbit</div>");
    await sleep(1);
    fileData = loadFile("./startup.txt");
    var lines = fileData.split('\n');
    for (var line = 0; line < lines.length; line++) {
        printT(lines[line]);
        await sleep(0.2);
    }
    await sleep(1);
}

async function main() {
    init();
    await startup();
    getInput();
}

/*****************************************************************************************************/

// Compute the input when return was pressed
async function runCommand(cmd) {
    switch (cmd.toLowerCase()) {
        
        case "restart": 
        case "reboot": 
            printT("Rebooting. Please wait");
            await waitT(".", 5, 0.5);
            document.getElementById("terminal").innerHTML = terminalDefaultContent;
            main();
            break;

        case "shutdown": 
            printT("Shutting down internal services");
            await waitT(".", 3, 1);
            printT("Goodbye!");
            await sleep(1);
            document.getElementById("terminal").innerHTML = "";
            break;

        case "clear": 
            document.getElementById("terminal").innerHTML = terminalDefaultContent;
            init();
            getInput(false);
            break;

        case "ls": 
            printT("This is the return value of the ls command!");
            getInput();
            break;


        default: // Über JSON File falls kein 'Aktiver' Command (also wenn nur text zurück)
            printT("Command not found: " + cmd);
            getInput();
            break;
    }
}

main();