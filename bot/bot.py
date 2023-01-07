import numpy as np
import random


def move(board, turn, depth):
    board = np.array(board)
    board[board == 2] = -1

    if turn == 1:
        player = 1
        maximising_agent = True
    else:
        player = -1
        maximising_agent = False

    children_moves = get_children_moves(board.copy(), player)
    scores = []
    for child_move in children_moves:
        scores.append(minimax(update_board(board.copy(), child_move, player), depth, not maximising_agent, -np.inf, np.inf))

    if maximising_agent:
        indices = np.where(scores == np.max(scores))[0]
        return children_moves[random.choice(indices)]
    else:
        indices = np.where(scores == np.min(scores))[0]
        print(f"Current score: {min(scores)}")
        return children_moves[random.choice(indices)]


def minimax(board, depth, maximising_agent, alpha, beta):
    if depth == 1 or game_over(board):
        return evaluate(board.copy())
    else:
        if maximising_agent:
            turn = 1
        else:
            turn = -1

        if not has_legal_moves(board, turn):
            maximising_agent = not maximising_agent

        if maximising_agent:
            max_eval = -np.inf
            for children_move in get_children_moves(board, 1):
                new_board = update_board(board.copy(), children_move, 1)
                child_eval = minimax(new_board.copy(), depth - 1, not maximising_agent, alpha, beta)
                max_eval = max(max_eval, child_eval)
                alpha = max(alpha, child_eval)
                if beta <= alpha:
                    break
            return max_eval
        else:
            min_eval = np.inf
            for children_move in get_children_moves(board, -1):
                new_board = update_board(board.copy(), children_move, -1)
                child_eval = minimax(new_board.copy(), depth - 1, not maximising_agent, alpha, beta)
                min_eval = min(min_eval, child_eval)
                beta = min(beta, child_eval)
                if beta <= alpha:
                    break
            return min_eval


def get_children_moves(board, player):
    children = []
    for row in range(8):
        for col in range(8):
            if is_legal_move(board, (row, col), player):
                children.append((row, col))
    return children


def update_board(board, new_move: tuple, player: int):
    board[new_move[0], new_move[1]] = player
    directions = ((0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1))
    for direction in directions:
        for coords in flip_pieces(board, player, new_move, direction):
            board[coords[0], coords[1]] = player
    return board


def game_over(board):
    return not has_legal_moves(board, 1) and not has_legal_moves(board, -1)


def is_legal_move(board, new_move, player):
    if board[new_move[0], new_move[1]] != 0:
        return False

    directions = ((0, 1), (1, 0), (0, -1), (-1, 0), (1, 1), (-1, -1), (1, -1), (-1, 1))
    for direction in directions:
        if len(flip_pieces(board, player, new_move, direction)) > 0:
            return True

    return False


def has_legal_moves(board, player):
    for new_move_x in range(8):
        for new_move_y in range(8):
            if is_legal_move(board, (new_move_x, new_move_y), player):
                return True
    else:
        return False


def flip_pieces(board, flip_player, new_move, direction):
    current_coordinates = new_move[0] + direction[0], new_move[1] + direction[1]
    stack = []
    while 0 <= current_coordinates[0] < 8 and 0 <= current_coordinates[1] < 8:
        if board[current_coordinates[0], current_coordinates[1]] == flip_player:
            break
        elif board[current_coordinates[0], current_coordinates[1]] == 0:
            stack.clear()
            break
        elif board[current_coordinates[0], current_coordinates[1]] == -1 * flip_player:
            stack.append(current_coordinates)
        else:
            raise Exception
        current_coordinates = current_coordinates[0] + direction[0], current_coordinates[1] + direction[1]
    else:
        stack.clear()
    return stack


def evaluate(board):
    if game_over(board):
        return game_results(board)
    zero_count = 64 - np.count_nonzero(board)
    multiplier = np.zeros((8, 8))
    multiplier[:, 0] = multiplier[0, :] = multiplier[:, 7] = 5
    multiplier[0, 0] = multiplier[0, 7] = multiplier[7, 0] = 15
    return np.sum(board * multiplier) / zero_count


def game_results(board):
    board_sum = np.sum(board)
    if board_sum == 0:
        return 0
    elif board_sum > 0:
        return np.inf
    elif board_sum < 0:
        return -np.inf

