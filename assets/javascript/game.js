$(document).ready(function () {

    // ________________________Global variables_________________________________
    // Create characters object with objects Korra | Mako | Bolin | Tenzin
    var characters = {
        "Korra": {
            name: "Korra",
            health: 180,
            attack: 7,
            imageUrl: "assets/images/characters/Korra.png",
            enemyAttackBack: 25
        },
        "Mako": {
            name: "Mako",
            health: 100,
            attack: 14,
            imageUrl: "assets/images/characters/Mako.png",
            enemyAttackBack: 5
        },
        "Bolin": {
            name: "Bolin",
            health: 150,
            attack: 8,
            imageUrl: "assets/images/characters/Bolin.png",
            enemyAttackBack: 20
        },
        "Tenzin": {
            name: "Tenzin",
            health: 120,
            attack: 8,
            imageUrl: "assets/images/characters/Tenzin.png",
            enemyAttackBack: 25
        }
    };
    //Optional sounds
    let audioBG = new Audio("assets/sounds/background.mp3");
    let audioFight = new Audio("assets/sounds/karatechop.m4a");
    //let audioGameOver = new Audio("assets/sounds/gameover.wav");
    let audioGameOver = new Audio("assets/sounds/gameover.wav");
    let audioGameWin = new Audio("assets/sounds/theend.mp3");
    let audioClick = new Audio("assets/sounds/typewriterkey.wav");
    //var audioBG = new Audio("assets/sounds/avatarsound.mp3");
    audioBG.play();

        

    let attacker;
    let combatants = [];
    let defender;
    let gameRound = 1;
    let charsDefeated = 0;

    // ____________________________Game Functions____________________________________________

    // Use jQuery to render the characters to the HTML
    let renderCharacter = function (character, renderArea) {
        var charDiv = $("<div class='character' data-name='" + character.name + "'>");
        var charName = $("<div class='character-name'>").text(character.name);
        var charImage = $("<img alt='image' class='character-image'>").attr("src", character.imageUrl);
        var charHealth = $("<div class='character-health'>").text(character.health);
        charDiv.append(charName).append(charImage).append(charHealth);
        $(renderArea).append(charDiv);
    };

    // Loads all the characters into the character section to be selected.
    let initializeGame = function () {
        for (var key in characters) {
            renderCharacter(characters[key], "#characters-section");
        }
        $("#attack-button").hide();
    };
    initializeGame();

    // Handles updating the selected player or the current defender. 
    let updateCharacter = function (charObj, areaRender) {
        $(areaRender).empty();
        renderCharacter(charObj, areaRender);
    };

    // Renders the available-to-attack enemies.
    let renderEnemies = function (enemyArr) {
        for (var i = 0; i < enemyArr.length; i++) {
            renderCharacter(enemyArr[i], "#available-to-attack-section");
        }
    };

    // Function to handle rendering game messages.
    let renderMessage = function (message) {
        // Builds the message and appends it to the page.
        var gameMessageSet = $("#game-message");
        var newMessage = $("<div>").text(message);
        gameMessageSet.append(newMessage);
    };

    // Handles restarting the game after victory or defeat.
    let restartGame = function (resultMessage) {
        let restart = $("<button class='btn btn-primary'>Restart</button>").click(function () {
            location.reload();
        });

        // Build div that will display the victory/defeat message.
        let gameState = $("<div>").text(resultMessage);

        // Render the restart button and victory/defeat message to the page.
        $("#game-message").append(gameState);
        $("#game-message").append(restart);
    };

    // Function to clear the game message section
    let clearMessage = function () {
        let gameMessage = $("#game-message");
        gameMessage.text("");
    };

    // _________________________Logic of the game___________________________________

    // On click event for selecting our character.
    $("#characters-section").on("click", ".character", function () {
        // Saving the clicked character's name.
        let name = $(this).attr("data-name");
        // Play an optional sound
        audioClick.play();
        // If a player character has not yet been chosen...
        if (!attacker) {
            // We populate attacker with the selected character's information.
            attacker = characters[name];
            // We then loop through the remaining characters and push them to the combatants array.
            for (let key in characters) {
                if (key !== name) {
                    combatants.push(characters[key]);
                }
            }
            // Hides the character select div.
            $("#characters-section").hide();

            // Then render our selected character and our combatants.
            updateCharacter(attacker, "#selected-character");
            renderEnemies(combatants);
        }
    });
    // Creates an on click event for each enemy.
    $("#available-to-attack-section").on("click", ".character", function () {
        audioClick.play();
        let name = $(this).attr("data-name");
        // If there is no defender, the clicked enemy will become the defender.
        if ($("#defender").children().length === 0) {
            defender = characters[name];
            updateCharacter(defender, "#defender");
            // remove element as it will now be a new defender
            $(this).remove();
            clearMessage();
        }
        $("#attack-button").show();
    });
    // When you click the attack button, run the following game logic.
    $("#attack-button").on("click", function () {
        // If there is a defender, allow for battle
        audioFight.play();
        if ($("#defender").children().length !== 0) {
            // Creates messages for our attack and our opponents counter attack.
            let attackMessage = "You attacked " + defender.name + " for " + attacker.attack * gameRound + " damage.";
            let counterAttackMessage = defender.name + " attacked you back for " + defender.enemyAttackBack + " damage.";
            clearMessage();

            // Reduce defender's health by your attack value.
            defender.health -= attacker.attack * gameRound;

            // If the enemy still has health..
            if (defender.health > 0) {
                updateCharacter(defender, "#defender");
                renderMessage(attackMessage);
                renderMessage(counterAttackMessage);
                attacker.health -= defender.enemyAttackBack;
                updateCharacter(attacker, "#selected-character");
                if (attacker.health <= 0) {
                    clearMessage();

                    restartGame("YOU NEED MORE TRAINING: GAME OVER!!!");
                    $("#attack-button").off("click");
                    $("#attack-button").hide();                    
                    audioGameOver.play();
                }
            } else {
                // If the enemy has less than zero health they are defeated.
                // Remove your opponent's character card.
                $("#defender").empty();

                let gameStateMessage = "You have defeated " + defender.name + ", you can choose to fight another enemy.";
                renderMessage(gameStateMessage);
                // Increment your kill count.
                charsDefeated++;
                // If you have killed all of your opponents you win.
                // Call the restartGame function to allow the user to restart the game and play again.
                if (charsDefeated >= combatants.length) {
                    clearMessage();
                    $("#attack-button").off("click");
                    $("#attack-button").hide();
                    restartGame("YOU'VE WON: BALANCE HAS BEEN RESTORED!"); 
                    audioGameWin.play();
                    audioBG.pause();
                    audioBG.currentTime = 0;
                }
            }
            // Increment turn counter. This is used for determining how much damage the player does.
            gameRound++;
        } else {
            // If there is no defender, render an error message.
            clearMessage();
            renderMessage("No enemy was selected");
        }
    });
});