import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useEventListener from "@use-it/event-listener";
import { v4 as uuid } from 'uuid';


const updateBoard = (board: Array<BoardPixelType | undefined>, piece: RotablePiece) => {
    const newBoard = board
        .map((pixel) => pixel?.pieceId === piece.pieceId ? undefined : pixel)
        .map((pixel, i) => {
            const col = i % 10;
            const row = Math.floor(i / 10);
            const shouldPaintResult = shouldPaint(col, row, piece);
            if (shouldPaintResult.paint && !pixel) {
                return shouldPaintResult;
            }
            return pixel;
        });
    return newBoard;

}
const validateBoard = (board: Array<BoardPixelType | undefined>, newPiece: RotablePiece, setPiece: Dispatch<SetStateAction<RotablePiece>>) => {
    const { positions, rotatePosition } = newPiece;
    const piecePosition = positions[rotatePosition % positions.length] as Tuple[];
    const newPosition: Tuple[] = piecePosition.map(([x, y]) => [x + newPiece.xOffset, y + newPiece.yOffset]);
    const isWithinBounds = newPosition.every(([x, y]) => x < 10 && x >= 0 && y < 20 && y >= 0);

    const isBoardClear = newPosition.every(([x, y]) => {
        const pixelInfo = board[y * 10 + x];
        return !pixelInfo || pixelInfo.pieceId === newPiece.pieceId;
    })

    if (isWithinBounds && isBoardClear) {
        setPiece(newPiece);
        return true;
    }
    return false;
}

const useTetris = () => {
    const [piece, setPiece] = useState(getNewPiece(false));
    const [nextPiece, setNextPiece] = useState(getNewPiece(false));
    const [board, setBoard] = useState<Array<BoardPixelType | undefined>>(() => Array.from(Array(10 * 20)).fill(undefined));


    const rotatePiece = () => {
        setPiece(newPiece => ({ ...newPiece, rotatePosition: newPiece.rotatePosition + 1 }));
    };

    const handler = ({ key }: KeyboardEvent) => {
        key === 'ArrowRight' && validateBoard(board, { ...piece, xOffset: piece.xOffset < 10 ? piece.xOffset + 1 : piece.xOffset }, setPiece);
        key === 'ArrowLeft' && validateBoard(board, { ...piece, xOffset: piece.xOffset > 0 ? piece.xOffset - 1 : piece.xOffset }, setPiece);
        key === 'ArrowDown' && validateBoard(board, { ...piece, yOffset: piece.yOffset + 1 }, setPiece);
        key === 'ArrowUp' && validateBoard(board, { ...piece, yOffset: piece.yOffset - 1 }, setPiece);
        key === ' ' && validateBoard(board, { ...piece, rotatePosition: piece.rotatePosition + 1 }, setPiece);
    };
    useEventListener('keydown', handler);
    useEffect(() => {

        if (piece.yOffset < 18) {
            const timeout = setTimeout(() => {
                const result = validateBoard(board, { ...piece, yOffset: piece.yOffset + 1 }, setPiece);
                if (!result) {
                    setPiece(nextPiece);
                    setNextPiece(getNewPiece());
                }
            }, 1200);
            return () => clearTimeout(timeout);
        } else {
            setPiece(nextPiece);
            setNextPiece(getNewPiece());
        }
    }, [nextPiece, piece]);

    useEffect(() => {
        setBoard(oldBoard => updateBoard(oldBoard, piece));

    }, [piece])

    useEffect(() => {
        // We need to randomize in an useEffect so hydration works https://nextjs.org/docs/messages/react-hydration-error
        setPiece(getNewPiece());
        setNextPiece(getNewPiece());
        setBoard(Array.from(Array(10 * 20)).fill(undefined));
    }, []);

    const getNextPieceTiles = () => {
        const pieceTiles = [];
        for (let i = 0; i < 16; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const { paint, color } = shouldPaint(col, row, nextPiece);
            pieceTiles.push(paint ? color : '');
        }
        return pieceTiles;
    };
    const paintPiece = (col: number, row: number) => shouldPaint(col, row, piece);
    return { board, getNextPieceTiles, paintPiece }

}

export default useTetris;

type BoardPixelType = {
    paint: boolean;
    color: string;
    pieceId: string;
}
export const shouldPaint = (c: number, r: number, currentPiece: RotablePiece): BoardPixelType => {
    const { positions, rotatePosition } = currentPiece;
    const piecePosition = positions[rotatePosition % positions.length] as Tuple[];
    return {
        paint: piecePosition?.some(s => s[0] + currentPiece.xOffset === c && s[1] + currentPiece.yOffset === r),
        color: currentPiece.color,
        pieceId: currentPiece.pieceId
    }
}

function getNewPiece(randomize = true): RotablePiece {
    if (!randomize) {
        return { ...pieces[0], rotatePosition: 0, pieceId: '', yOffset: 0, xOffset: 0 };
    }
    const pieceNumber = Math.floor(Math.random() * 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    return { ...pieces[pieceNumber], rotatePosition: 0, pieceId: uuid(), yOffset: 0, xOffset: 0 };
}

type RotablePiece = Piece & { rotatePosition: number; pieceId: string; yOffset: number, xOffset: number };
// [col, row]
type Piece = {
    name: string;
    color: string;
    positions: Tuple[][];
}
type Tuple = [number, number];

//cyan
const piece1: Piece = {
    name: 'line',
    color: 'bg-cyan-400',
    positions: [[[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]]]
};
// blue
const piece2: Piece = {
    name: 'mirrored L',
    color: 'bg-blue-700',
    positions: [[[1, 0], [1, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]]]
};
// orange
const piece3: Piece = {
    name: 'L',
    color: 'bg-orange-500',
    positions: [[[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 0]]]
};
// yellow
const piece4: Piece = {
    name: 'square',
    color: 'bg-yellow-400',
    positions: [[[0, 0], [0, 1], [1, 0], [1, 1]]]
};
const piece5: Piece = {
    name: 's',
    color: 'bg-green-400',
    positions: [[[1, 0], [0, 1], [1, 1], [2, 0]], [[0, 0], [0, 1], [1, 1], [1, 2]]]
};
const piece6: Piece = {
    name: 'triangle',
    color: 'bg-violet-700',
    positions: [[[0, 0], [1, 0], [1, 1], [2, 0]], [[1, 0], [1, 1], [0, 1], [1, 2]], [[0, 1], [1, 0], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [0, 2]]]
};
const piece7: Piece = {
    name: 'red',
    color: 'bg-red-800',
    positions: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [1, 1], [0, 1], [0, 2]]]
};
const pieces = [piece1, piece2, piece3, piece4, piece5, piece6, piece7] as const;
