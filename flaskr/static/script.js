const height = 8;
const width = 8;
const player_turn = 1;
const opponent_turn = 2;

var game_over = false;

var difficulty = 4;

var player_move = true;

const board = new Array(height)
for(let i = 0; i < height; i++){
    board[i] = new Array(width);
    for(let j = 0; j < width; j++){
        board[i][j] = 0;
    }
}

board[3][3] = board[4][4] = 1;
board[3][4] = board[4][3] = 2;

function count_pieces(turn){
    var occurrences = 0;
    board.forEach(row => row.forEach(square => {
        if(square === turn){
            occurrences++;
        }
    }))
    return occurrences;
}


function render_board(){
    var game_container = document.getElementById("game_container");
    var table = "<table id='game_board'>";

    for(let i = 0; i < height; i++){
        var new_row = "<tr class='game_board_row'>";

        for(let j = 0; j < width; j++){
            var new_square = `<td class='game_board_square' onclick='move(${i}, ${j})'>`;
            if(board[i][j] === 1){
                new_square += "<img class='black_discs' src='../static/black_disc.png'></img>";
            }
            else if(board[i][j] === 2){
                new_square += "<img class='white_discs' src='../static/white_disc.png'></img>";
            }
            new_square += "</td>";
            new_row += new_square;
        }
        new_row += "</tr>";
        table += new_row;
    }
    game_container.innerHTML = table;
    document.getElementById("player_counter").innerHTML = `Player Count:<br>${count_pieces(player_turn)}`;
    document.getElementById("AI_counter").innerHTML = `AI Count:<br>${count_pieces(opponent_turn)}`;
    console.log(board);

    if(!has_legal_move(opponent_turn) && !has_legal_move(player_turn)){
        setTimeout(end_game, 500);
    }
}


function has_legal_move(turn){
    for(var row = 0; row < 8; row++){
        for(var col = 0; col < 8; col++){
            if(is_legal_move(row, col, turn)) return true;
        }
    }

    return false;
}


function is_legal_move(row, column, turn){
    if(board[row][column] === 1 || board[row][column] === 2){
        return false;
    }
    if(capture_pieces(row, column, turn).size === 0){
        return false;
    }
    return true;
}

function capture_in_direction(row, column, direction, turn){
    current_row = row + direction[0];
    current_col = column + direction[1];

    var temporary_opponent_turn = 0;
    if(turn === 1){
        temporary_opponent_turn = 2;
    }
    else{
        temporary_opponent_turn = 1
    }

    var capture = false;
    const to_capture = new Set();

    while(0 <= current_row && 0 <= current_col && 8 > current_row && 8 > current_col){
        if(board[current_row][current_col] === turn){
            capture = true;
            break;
        }
        else if(board[current_row][current_col] === temporary_opponent_turn){
            to_capture.add([current_row, current_col])
        }
        else{
            break;
        }

        current_row = current_row + direction[0];
        current_col = current_col + direction[1];
    }
    if(capture){
        return to_capture;
    }
    else{
        return new Set();
    }
}


function capture_pieces(row, column, turn){
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
    var all_to_flip = new Set();
    for(var i = 0; i < 8; i++){
        var next_direction = directions[i];
        var to_flip = capture_in_direction(row, column, next_direction, turn);
        to_flip.forEach(all_to_flip.add, all_to_flip);
    }
    return all_to_flip;
}

function flip_piece(coordinates, turn){
    board[coordinates[0]][coordinates[1]] = turn;
}

function place_piece(row, column, turn){
    board[row][column] = turn;
}


function move(row, column){
    if(is_legal_move(row, column, player_turn) && player_move){
        place_piece(row, column, player_turn)
        capture_pieces(row, column, player_turn).forEach((coordinates) => {flip_piece(coordinates, player_turn)});
        render_board();
        player_move = false;
        if(has_legal_move(opponent_turn)){
            setTimeout(function(){
                get_opponent_move();
            }, 500);
        }
        else{
            if(has_legal_move(player_turn)) setTimeout(function(){window.alert("Bot has no moves.")}, 50);
            player_move = true;
        }
    }
}


function get_opponent_move(){
    var jsonData = {
        "board": board,
        "turn": opponent_turn,
        "depth": difficulty,
        "method": "cors"
    }

    fetch("http://localhost:5000/play", {
        method: "POST",
        headers: {
            "Content-Type": 'application/json; charset=UTF-8'
        },
        body: JSON.stringify(jsonData),
    }).then(
        response => response.json()
    ).then(
        json => {
            opponent_move_row = json["row"];
            opponent_move_column = json["column"];
            opponent_makes_move(opponent_move_row, opponent_move_column);
        }
    )

}


function end_game(){
    game_over = true;
    var player_count = count_pieces(player_turn);
    var opponent_count = count_pieces(opponent_turn);
    if(player_count > opponent_count){
        window.alert("You won!");
    }
    else if(player_count < opponent_count){
        window.alert("You lost!");
    }
    else{
        window.alert("Draw!");
    }

    window.location.href = "/";
}


function opponent_makes_move(row, column){
    place_piece(row, column, opponent_turn);
    var opponent_flip = capture_pieces(row, column, opponent_turn);
    opponent_flip.forEach(coordinates => flip_piece(coordinates, opponent_turn));
    render_board();
    if(!game_over){
        if(has_legal_move(player_turn)){
            player_move = true;
        }
        else if(has_legal_move(opponent_turn)){
            setTimeout(function() {alert("You have no moves")}, 50);
            setTimeout(get_opponent_move(), 500);
        }
    }
}


function set_difficulty(new_difficulty){
    difficulty = new_difficulty;
}

render_board();