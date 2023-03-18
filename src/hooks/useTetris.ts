import { useEffect, useState } from "react";
import useEventListener from "@use-it/event-listener";

const useTetris = () => {
    const [pieceHeight, setPieceHeight] = useState(0);
    const [cursorOffset, setCursorOffset] = useState(0);
    const [piece, setPiece] = useState(getRandomPiece());
    const [nextPiece, setNextPiece] = useState(getRandomPiece());
    const board = Array.from(Array(10 * 20).keys());

    const handler = ({ key }: KeyboardEvent) => {
        key === 'ArrowRight' && setCursorOffset(offset => offset < 10 ? offset + 1 : offset);
        key === 'ArrowLeft' && setCursorOffset(offset => offset > 0 ? offset - 1 : offset);
        key === 'ArrowDown' && setPieceHeight(height => height < 18 ? height + 1 : height);
        key === ' ' && setPiece(piece => ({ ...piece, rotatePosition: piece.rotatePosition++ }));
        //key === 'ArrowUp' && console.log('up'); 
    };

    useEventListener('keydown', handler);
    useEffect(() => {
        if (pieceHeight < 18) {
            const timeout = setTimeout(() => setPieceHeight(h => h + 1), 1200);
            return () => clearTimeout(timeout);
        } else {
            setPieceHeight(0);
            setPiece(nextPiece);
            setNextPiece(getRandomPiece());
        }
    }, [pieceHeight]);

    const getNextPieceTiles = () => {
        const pieceTiles = [];
        for (let i = 0; i < 16; i++) {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const { paint, color } = shouldPaint(col, row, 0, nextPiece, 0);
            pieceTiles.push(paint ? color : '');
        }
        return pieceTiles;
    };
    const paintPiece = (col: number, row: number) => shouldPaint(col, row, pieceHeight, piece, cursorOffset);
    return { board, getNextPieceTiles, paintPiece }

}

export default useTetris;

export const shouldPaint = (c: number, r: number, pieceHeight: number, currentPiece: RotablePiece, cursorOffset: number) => {
    const { positions, rotatePosition } = currentPiece;
    const piecePosition = positions[rotatePosition % positions.length];
    return {
        paint: piecePosition?.some(s => s[0] + cursorOffset === c && s[1] + pieceHeight === r),
        color: currentPiece.color
    }
}

type RotablePiece = Piece & { rotatePosition: number };
// [col, row]
type Piece = {
    name: string;
    color: string;
    tiles: Tuple[];
    positions: Tuple[][];
}
type Tuple = [number, number];

//cyan
const piece1: Piece = {
    name: 'line',
    color: 'bg-cyan-400',
    tiles: [[0, 0], [0, 1], [0, 2], [0, 3]],
    positions: [[[0, 0], [0, 1], [0, 2], [0, 3]], [[0, 0], [1, 0], [2, 0], [3, 0]]]
};
// blue
const piece2: Piece = {
    name: 'mirrored L',
    color: 'bg-blue-700',
    tiles: [[1, 0], [1, 1], [0, 2], [1, 2]],
    positions: [[[1, 0], [1, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 1], [2, 1]], [[0, 0], [0, 1], [0, 2], [1, 0]], [[0, 0], [1, 0], [2, 0], [2, 1]]]
};
// orange
const piece3: Piece = {
    name: 'L',
    color: 'bg-orange-500',
    tiles: [[0, 0], [0, 1], [0, 2], [1, 2]],
    positions: [[[0, 0], [0, 1], [0, 2], [1, 2]], [[0, 0], [0, 1], [1, 0], [2, 0]], [[0, 0], [1, 0], [1, 1], [1, 2]], [[0, 1], [1, 1], [2, 1], [2, 0]]]
};
// yellow
const piece4: Piece = {
    name: 'square',
    color: 'bg-yellow-400',
    tiles: [[0, 0], [0, 1], [1, 0], [1, 1]],
    positions: [[[0, 0], [0, 1], [1, 0], [1, 1]]]
};
const piece5: Piece = {
    name: 's',
    color: 'bg-green-400',
    tiles: [[1, 0], [0, 1], [1, 1], [2, 0]],
    positions: [[[1, 0], [0, 1], [1, 1], [2, 0]], [[0, 0], [0, 1], [1, 1], [1, 2]]]
};
const piece6: Piece = {
    name: 'triangle',
    color: 'bg-violet-700',
    tiles: [[0, 0], [1, 0], [1, 1], [2, 0]],
    positions: [[[0, 0], [1, 0], [1, 1], [2, 0]], [[1, 0], [1, 1], [0, 1], [1, 2]], [[0, 1], [1, 0], [1, 1], [2, 1]], [[0, 0], [0, 1], [1, 1], [0, 2]]]
};
const piece7: Piece = {
    name: 'red',
    color: 'bg-red-800',
    tiles: [[0, 0], [1, 0], [1, 1], [2, 1]],
    positions: [[[0, 0], [1, 0], [1, 1], [2, 1]], [[1, 0], [1, 1], [0, 1], [0, 2]]]
};
const pieces = [piece1, piece2, piece3, piece4, piece5, piece6, piece7] as const;


const getRandomPiece = (): RotablePiece => {
    const pieceNumber = Math.floor(Math.random() * 7) as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    return { ...pieces[pieceNumber], rotatePosition: 0 };
}