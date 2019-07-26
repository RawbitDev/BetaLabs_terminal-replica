/********** [ SETTINGS ] **********/

//General settings
var t_header = "BetaLabsOS [Version 1.0.0] (c) 2019 MrRawbit";
var t_prefix = "root@BetaLabs.io:~#";
var t_dialog = "Sind Sie sicher, dass Sie fortfahren möchten";
var t_writeSpeed = 0.025;
var t_maxInput = 999999;
var t_startupPath = "./startup.txt";

/********** [ GENERAL ] **********/

//Pause the javascript execution for a specific time
function sleep(sec) {
    return new Promise(resolve => setTimeout(resolve, sec * 1000)); //Wait x seconds
}

/********** [ MAIN TERMINAL BACKEND ] **********/

var t_terminal;
var t_cursor;
var t_input;
var terminalDefaultContent;

//Boot sequence
async function boot() {
    init();
    await t_startup(); //Print the startup message
    runCommand(await t_getln()); //Ready for first input
}

//Initialize the terminal and event listeners
function init() {
    t_terminal = document.getElementById("terminal");
    t_cursor = document.getElementById("cursor");
    t_input = document.getElementById("input");
    terminalDefaultContent = t_terminal.innerHTML; //Save the default terminal content before the startup
    t_input.addEventListener("focus", cursorHandler);
    t_input.addEventListener("blur", cursorHandler);
    t_terminal.addEventListener("click", function() {
        t_input.focus();
    });
    input.focus();
}

//Print raw to the terminal
function t_printRaw(raw) {
    t_cursor.insertAdjacentHTML("beforebegin", raw); //Add raw infront of cursor
    t_terminal.scrollTop = t_terminal.scrollHeight; //Scroll window to new line
}

//Get an input of the user
async function t_getRaw(max=t_maxInput) {
    t_print(""); //Prepare temp input container
    t_input.value = "";
    t_input.maxLength = max;
    inputHandlerBusy = max;
    t_input.addEventListener("keyup", inputHandler); //Enable input handler
    t_input.focus();
    while(inputHandlerBusy>0) {await sleep(0.1);} //Wait for input handler to be done
    return t_input.value;
}
//Event handler for the input
var inputHandlerBusy;
function inputHandler(event) {
    event.preventDefault();
    resetCursor(); //Make sure cursor is always at the end to prevent bugs
    if(inputHandlerBusy>2) {
        t_input.value = t_input.value.replace(/<|>/gi, ""); //Remove angle brackets to prevent simple code injection
    }
    if (event.keyCode === 13 || inputHandlerBusy <= 0) { //If the return key was pressed
        t_input.removeEventListener("keyup", inputHandler); //Disable input handler
        inputHandlerBusy = 0; //Return to caller
    } else {
        t_cursor.previousElementSibling.innerHTML = t_input.value;
        inputHandlerBusy--;
    }
}
//Set cursor position to end of input field
function resetCursor() {
    if (t_input.setSelectionRange) { // Modern browsers
        t_input.focus();
        t_input.setSelectionRange(t_input.value.length, t_input.value.length);
    } else if (t_input.createTextRange) { // IE8 and below
        var range = t_input.createTextRange();
        range.collapse(true);
        range.moveEnd("character", t_input.value.length);
        range.moveStart("character", t_input.value.length);
        range.select();
    }
}

//Event handler for blinking cursor
var blink = false;
async function cursorHandler(event) {
    event.preventDefault();
    if (event.type == "blur") {
        t_cursor.hidden = false;
        blink = false;
    } else {
        blink = true;
    }
    //Blinking cursor
    while (blink == true) {
        t_cursor.hidden = true;
        await sleep(0.5);
        t_cursor.hidden = false;
        await sleep(0.5);
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
async function t_writeln(message, sec=t_writeSpeed) {
    t_ln();
    await t_write(message, sec);
}

//Output the startup message
async function t_startup() {
    await sleep(2);
    await t_write(t_header);
    await sleep(1);
    fileData = loadFile(t_startupPath); //Get content of the startup file
    var lines = fileData.split('\n'); //Split it in its lines
    for (var line=0; line<lines.length; line++) { //Print every line by line with a delay between them
        t_println(lines[line]);
        await sleep(0.2);
    }
    await sleep(1);
}
//Read a linked file
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

/********** [ ADDITIONAL INPUT FUNCTIONS ] **********/

//Basic input dialog
async function t_get(message=t_prefix, max=t_maxInput) {
    t_print(message + " ");
    return await t_getRaw(max);
}

//Input dialog with line break
async function t_getln(message=t_prefix, max=t_maxInput) {
    t_ln();
    return t_get(message, max);
}

//Yes or no dialog
async function t_getBool(message=t_dialog) {
    message = message.replace("?", ""); //Remove question mark
    var input = await t_getln(message + " [Y/n]?", 1);
    while (input.toLowerCase() != "y" && input.toLowerCase() != "n") {
        t_println("Fehlerhafte Eingabe! Bitte erneut versuchen.");
        input = await t_getln(message + " [Y/n]?", 1);
    }
    if(input.toLowerCase() == "y") {
        return true;
    } else if(input.toLowerCase() == "n") {
        return false;
    }
}






/*****************************************************************************************************/

// Compute the input when return was pressed
async function runCommand(cmd) {
    switch (cmd.toLowerCase()) {
        
        case "restart": 
        case "reboot": 
            t_println("Rebooting. Please wait");
            await t_write(".....", 0.5);
            t_terminal.innerHTML = terminalDefaultContent;
            boot();
            break;

        case "shutdown": 
            t_println("Shutting down internal services");
            await t_write("...", 1);
            t_println("Goodbye!");
            await sleep(1);
            t_terminal.innerHTML = "";
            break;

        case "clear": 
            t_terminal.innerHTML = terminalDefaultContent;
            init();
            runCommand(await t_getln());
            break;

        case "ls": 
            t_println("This is the return value of the ls command!");
            runCommand(await t_getln());
            break;


        default: // Über JSON File falls kein 'Aktiver' Command (also wenn nur text zurück)
            t_println("Command not found: " + cmd);
            runCommand(await t_getln()); //Ready for the next input
            break;
    }
}

/*****************************************************************************************************/






boot();