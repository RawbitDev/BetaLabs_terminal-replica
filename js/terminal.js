//General declarations
var t_terminal = document.getElementById("terminal");
var t_cursor = document.getElementById("cursor");
var t_input = document.getElementById("input");
//General settings
var t_writeSpeed = 0.15;

/********** [ GENERAL ] **********/

//Pause the javascript execution for a specific time
function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000)); //Wait x seconds
}

/********** [ MAIN TERMINAL BACKEND ] **********/

//Print raw to the terminal
function t_printRaw(raw) {
    t_cursor.insertAdjacentHTML("beforebegin", raw); //Add raw infront of cursor
    t_terminal.scrollTop = t_terminal.scrollHeight; //Scroll window to new line
}

//Get an input of the user
async function t_getRaw() {
    t_print(""); //Prepare temp input container
    t_input.value = "";
    t_input.addEventListener("keyup", inputHandler); //Enable input
    t_input.focus();
    // ###
    // ###
    // ### Do something to wait for the return of the event handler ###
    // ###
    // ###
    t_input.removeEventListener("keyup", inputHandler); //Disable input
    return t_input.value;
}

// Event handler for the input
function inputHandler(callback, event) {
    event.preventDefault();
    resetCursor(); //Make sure cursor is always at the end to prevent bugs
    t_input.value = t_input.value.replace(/<|>/gi, ""); //Remove angle brackets to prevent code injection
    if (event.keyCode === 13) { //If return was pressed
        // ###
        // ###
        // ### Do Something when return was pressed ###
        // ###
        // ###
    } else {
        t_cursor.previousElementSibling.innerHTML = input.value;
    }
}

//Set cursor position to end of input field
function resetCursor() {
    var input = document.getElementById("input");
    if (input.setSelectionRange) { // Modern browsers
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
    } else if (input.createTextRange) { // IE8 and below
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd("character", input.value.length);
        range.moveStart("character", input.value.length);
        range.select();
    }
}

/********** [ ADDITIONAL OUTPUT FUNCTIONS ] **********/

//Print basic message
function t_print(message) {
    t_printRaw("<div>" + message + "</div>");
}

//Write basic message (slow print)
async function t_write(message, sec=t_writeSpeed) {
    for (var i=0; i<message.length; i++) {
        t_print(message.charAt(i));
        await sleep(sec);
    }
}

//Print line break(s)
function t_ln(count=1) {
    for (var i=0; i<count; i++) {
        t_printRaw("<br />");
    }
}

//Print message with line break
function t_println(message) {
    t_ln();
    t_print(message);
}

//Write message with line break
function t_writeln(message, sec=t_writeSpeed) {
    t_ln();
    t_write(message, sec);
}

/********** [ ADDITIONAL INPUT FUNCTIONS ] **********/















// Get an input of the user
function getInput(message) {
    if (message) {
        t_printRaw(message);
    }
    t_printRaw("<div></div>");
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


function getYesNo(message) {
    t_println(message + "[Y/n]?");
    t_printRaw("<div></div>");
    var input = document.getElementById("input");
    input.value = "";
    input.addEventListener("keyup", inputHandler);
    input.focus();
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
    t_printRaw("<div>BetaLabsOS [Version 1.0.0] (c) 2019 MrRawbit</div>");
    await sleep(1);
    fileData = loadFile("./startup.txt");
    var lines = fileData.split('\n');
    for (var line = 0; line < lines.length; line++) {
        t_println(lines[line]);
        await sleep(0.2);
    }
    await sleep(1);
}

async function main() {
    init();
    //await startup();
    t_getRaw();
    //getInput();
}

/*****************************************************************************************************/

// Compute the input when return was pressed
async function runCommand(cmd) {
    switch (cmd.toLowerCase()) {
        
        case "restart": 
        case "reboot": 
            t_println("Rebooting. Please wait");
            await waitT(".", 5, 0.5);
            document.getElementById("terminal").innerHTML = terminalDefaultContent;
            main();
            break;

        case "shutdown": 
            t_println("Shutting down internal services");
            await waitT(".", 3, 1);
            t_println("Goodbye!");
            await sleep(1);
            document.getElementById("terminal").innerHTML = "";
            break;

        case "clear": 
            document.getElementById("terminal").innerHTML = terminalDefaultContent;
            init();
            getInput("<div>root@BetaLabs.io:~# </div>");
            break;

        case "ls": 
            t_println("This is the return value of the ls command!");
            getInput("<br /><div>root@BetaLabs.io:~# </div>");
            break;


        default: // Über JSON File falls kein 'Aktiver' Command (also wenn nur text zurück)
            t_println("Command not found: " + cmd);
            getInput("<br /><div>root@BetaLabs.io:~# </div>");
            break;
    }
}

main();