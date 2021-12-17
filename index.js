const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require('constants')
const { read } = require('fs')
const readline = require('readline')
const { runInThisContext } = require('vm')
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout,
)

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve)
  })
}

//Room Class-object generator
class Room {
  constructor(name, description, connections, inventory, locked) {
    this.name = name
    this.description = description
    this.connections = connections
    this.inventory = inventory
    this.locked = locked || false
  }
}

//Player Class

class Player {
  constructor(inventory, location) {
    this.inventory = inventory
    this.location = location
  }
}
//Inventory Class-need this to be a class because we are generating more than 1 item
class Item {
  constructor(name, description, takeable, action) {
    this.name = name
    this.desc = description
    this.takeable = takeable || false //dont supply a value the default is false
    this.action = action || 'nothing happens...'
  }
}

//initiating the room objects
let buildingLobbyRoom = new Room(
  'buildingLobby',
  'You entered the building lobby',
  ['stairwell'],
  ['sign'],
)

let stairwellRoom = new Room(
  'stairwell',
  'You have gone up the stairs to the second floor. You still need to enter the hallway to find the key to unlock the studio!  What do you want to do next?',
  ['buildingLobby', 'hallway'],
)

let hallwayRoom = new Room(
  'hallway',
  'You are in the hallway. There are shoes, coats, and a planter here. Examine these items to find the hidden key.Namaste!',
  ['stairwell', 'studio'],
  ['shoes'],
)

let studioRoom = new Room(
  'studio',
  'Success! You are now in the hot yoga studio. Take childs pose wait for class to start and enter exit to end the game',
  ['hallway'],
  [],
  true,
)

//initiate the items
let shoes = new Item(
  'shoes',
  'Wow alot of shoes means this Yoga class is crowded, better hurry to sign up',
  false,
)
let key = new Item('key', 'Use the key to unlock the door', true)
let sign = new Item(
  'sign',
  'Hello Yogi, The Hot Yoga Studio is on the second floor. You will need to find the key to unlock the door',
  false,
)

let itemLookup = {
  key: key,
  shoes: shoes,
  sign: sign,
}

//State Machine and Valid transitions from room to room
let locationLookup = {
  buildingLobby: buildingLobbyRoom,
  stairwell: stairwellRoom,
  hallway: hallwayRoom,
  studio: studioRoom,
}

let inventory = []

//Commands Object
class CommandsEngine {
  constructor(player) {
    this.player = player
  }

  //functions to handle different commands and execute actions
  handleInput(input) {
    let response = ''
    let stringList = input.split(' ') //user enters string and is stored in an array
    let enteredCommand = stringList[0]
    let enteredActivity = stringList.slice(1)
    if (enteredCommand === 'gargle') {
      response = this.handleGargle(includes.enteredActivity)
    } else if (enteredCommand === 'examine') {
      response = this.handleExamine(enteredActivity)
      //The sign says Welcome to Hot Yoga! Come on up to the second floor. If the door is locked, you will need to examine items in the hallway on the second floor  to find the key to unlock the studio door.',
    } else if (enteredCommand === 'take') {
      response = this.handleTake(enteredActivity)
    } else if (enteredCommand === 'unlock') {
      response = this.handleUnlock(enteredActivity)
    } else if (enteredCommand === 'enter') {
      response = this.handleEnter(enteredActivity)
    } else if (enteredCommand === 'look') {
      response = this.handleLook()
    } else if (enteredCommand === 'read') {
      response = this.handleRead()
    } else {
      response =
        "Sorry, I don't know how to " + stringList[0] + 'Please try again'
    }
    return response
  }
  handleGargle(input) {
    return 'garglglglglgl'
  }
  handleExamine(input) {
    if (input[0] != 'shoes')
      return 'you looked at ' + input[0] + ' the key is not here...keep looking'
    else
      return 'You found the key to unlock the door! You need to take the key before you can unlock the door to the studio. What do you want to do next?'
  }

  handleTake(input) {
    let currentRoom = this.player.location

    if (input[0] === 'key' && currentRoom === 'hallway') {
      inventory.push('key')
      return `The key is in your player inventory. What do you want to do next?`
    } else {
      return (
        "You are either not in the correct room or You can't take the " +
        input[0]
      )
    }
  }
  handleUnlock(input) {
    let currentRoom = this.player.location
    if (currentRoom === 'hallway') {
      //fail safe if player has key
      return 'The door is unlocked. You may enter the studio.'
    } else {
      return 'This is not the door you need to unlock. Try again'
    }
  }

  handleEnter(input) {
    let newLocation = input[0] //this is the location the user has inputted
    let currentRoom = locationLookup[this.player.location]
    //current room is the player's current location room object
    if (!currentRoom.connections.includes(newLocation)) {
      return 'This is not a valid transition. Try Again!!'
    }
    this.player.location = newLocation
    return locationLookup[newLocation].description
  }
  handleLook() {
    return locationLookup[this.player.location].connections
  }

  handleRead() {
    return 'The hot yoga studio is on the second floor. You must enter the stairwell to get to the second floor hallway. When you get to the hallway examine the items to find the key to unlock the door to the studio.Which room do you want to enter next?'
  }
}

//function to start the functionality of the game
async function start() {
  let player = new Player(['yogaMat'], 'buildingLobby')
  let engine = new CommandsEngine(player)

  const welcomeMessage = `Welcome to the North End Studios building, home of Hot Yoga Burlington! 
  You are standing in the building lobby. You will need to follow a specific 
  path and unlock a door to access the studio. First read the sign to understand 
  how to get to the hot yoga studio on the second floor.Namaste! 
   What do you  want to do next? >_`
  let answer = await ask(welcomeMessage)
  while (answer !== 'exit') {
    let response = engine.handleInput(answer)
    console.log(response)
    //Ask the user for their next input
    answer = await ask('>_ ')
  }

  process.exit()
}

start()
