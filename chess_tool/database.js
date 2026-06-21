// database.js
// Houses all raw level configurations, stages, overlays, and Endless Blitz data

export const SYLLABUS_LEVELS = [
  {
    id: 1,
    title: "Carlsbad Structure",
    concept: "Identify backward pawns, outpost squares, and execute minority attacks.",
    fen: "r1r3k1/1b1nbppp/1ppqp3/3p4/1P1P4/2N1PN2/2Q1BPPP/1RR3K1 w - - 0 1",
    stages: [
      {
        type: "CLICK_WEAKNESS",
        question: "Black's b-pawn moved, leaving the c6-pawn backward and vulnerable. Click the backward pawn.",
        correctTarget: "c6",
        successText: "Correct! The c6 pawn has fallen behind and can no longer be protected by another pawn.",
        failureText: "Not quite. That pawn can still be defended by the c-pawn. Look for a pawn that has fallen behind.",
        xrayHighlights: {
          chains: [
            ["d5", "e6", "f7", "g7", "h7"],
            ["a6", "b6"],
            ["d4", "e3", "f2", "g2", "h2"]
          ],
          weaknesses: ["c6"]
        }
      },
      {
        type: "CLICK_OUTPOST",
        question: "Which square is a perfect outpost hole for White's Knight, immune to pawn attacks?",
        correctTarget: "c5",
        successText: "Perfect! The c5 square is blockaded by Black's pawns and acts as an unassailable home for White's pieces.",
        failureText: "No, that square can be easily attacked or is not in Black's territory. Look for a hole in the c-file.",
        xrayHighlights: {
          chains: [
            ["d5", "e6", "f7", "g7", "h7"],
            ["b6", "c6"],
            ["d4", "e3", "f2", "g2", "h2"]
          ],
          outposts: ["c5"],
          openFiles: ["c"]
        }
      },
      {
        type: "MOVE_PAWN",
        question: "Execute the minority attack. Push White's b-pawn forward to break open Black's chain.",
        correctTarget: "b4-b5",
        successText: "Brilliant! Pushing the b-pawn initiates a minority attack, intending to swap on c6 and isolate Black's pawn structure.",
        failureText: "Incorrect pawn move. Look for the pawn on the b-file that can march forward to challenge Black's pawns.",
        xrayHighlights: {
          chains: [
            ["d5", "e6", "f7", "g7", "h7"],
            ["a6", "b6", "c6"]
          ],
          levers: ["b4-b5"]
        }
      }
    ]
  },
  {
    id: 2,
    title: "Isolated Queen's Pawn",
    concept: "Learn IQP dynamic features, blockading squares, and dynamic routing.",
    fen: "r1bq1rk1/pp2bppp/2n1pn2/3p4/3P4/2NB1N2/PP3PPP/R1BQ1RK1 w - - 0 1",
    stages: [
      {
        type: "CLICK_WEAKNESS",
        question: "Identify and click the isolated pawn on the board.",
        correctTarget: "d4",
        successText: "Correct! White's d4 pawn has no adjacent pawns to support it, making it isolated.",
        failureText: "Not that one. Look for a pawn that has no friendly pawns on its adjacent files (the c- and e-files).",
        xrayHighlights: {
          weaknesses: ["d4"],
          openFiles: ["c", "e"]
        }
      },
      {
        type: "CLICK_OUTPOST",
        question: "Which square must Black control to block White's isolated pawn from advancing?",
        correctTarget: "d5",
        successText: "Excellent! The d5 square blockades the IQP, preventing it from advancing and opening up the files.",
        failureText: "Incorrect. The blockading square is the square directly in front of the isolated pawn.",
        xrayHighlights: {
          outposts: ["d5"],
          weaknesses: ["d4"],
          openFiles: ["c", "e"]
        }
      },
      {
        type: "PLAN_SELECTION",
        question: "White's plan is a dynamic kingside attack, whereas Black's is trading pieces. What should White do?",
        options: [
          "Trade all minor pieces to reach an endgame",
          "Shift pieces to the kingside and create attacking vectors",
          "Play passively and guard the d4 pawn"
        ],
        correctTarget: "1", // 0-indexed index 1: Shift pieces to the kingside
        successText: "Spot on! The IQP grants White space and activity; trade favors the defender (Black).",
        failureText: "Incorrect. Think about what the isolated pawn gives White: extra space and active piece play. Trading pieces simplifies the game, which helps the defender.",
        xrayHighlights: {
          weaknesses: ["d4"]
        }
      }
    ]
  },
  {
    id: 3,
    title: "The Hedgehog Structure",
    concept: "Understand Black's defensive spine and explosive counter-breaks.",
    fen: "r1bq1rk1/1b2bppp/p2ppn2/1p6/3PP3/1PNB1N2/PB2QPPP/2R2RK1 w - - 0 1",
    stages: [
      {
        type: "CLICK_WEAKNESS",
        question: "The Hedgehog spines control the 5th rank. Click Black's key pawn defending the center.",
        correctTarget: "d6,e6", // Accepts either d6 or e6
        successText: "Yes! The pawns on d6 and e6 act as defensive spines, stopping White's central expansions.",
        failureText: "No, look at the row of pawns on the 6th rank. The ones in the center are the core spines.",
        xrayHighlights: {
          chains: [
            ["a6", "b6"],
            ["d6", "e6", "f7", "g7", "h7"]
          ],
          weaknesses: ["d6", "e6"]
        }
      },
      {
        type: "CLICK_OUTPOST",
        question: "Identify the square where Black targets their explosive center break.",
        correctTarget: "d5",
        successText: "Brilliant! The d5 push is the critical counter-strike that dismantles White's center.",
        failureText: "No, that's not the central pawn break. Look at the pawn on d6; which square will it push to?",
        xrayHighlights: {
          chains: [
            ["a6", "b6"],
            ["d6", "e6"]
          ],
          outposts: ["d5"],
          levers: ["d6-d5"]
        }
      }
    ]
  },
  {
    id: 4,
    title: "Closed Center (French)",
    concept: "Learn how locked centers dictate opposite-side attacks.",
    fen: "r1bqk2r/pp2bppp/2n1p3/3pP3/3P4/5N2/PP3PPP/RNBQKB1R w KQkq - 0 1",
    stages: [
      {
        type: "CLICK_OUTPOST",
        question: "Click the side of the board where White's pawn chain (d4-e5) directs White's attack.",
        correctTarget: "e7,f7,g7,h7,e8,f8,g8,h8", // Accepts any kingside square in Black's camp
        successText: "Correct! White's pawn chain points to the kingside, indicating attacking potential there.",
        failureText: "Incorrect. Follow the pawn chain direction from d4 to e5: it points toward the Kingside.",
        xrayHighlights: {
          chains: [
            ["d4", "e5"],
            ["d5", "e6", "f7"]
          ]
        }
      },
      {
        type: "CLICK_WEAKNESS",
        question: "Click the square where Black should strike White's center with a pawn lever.",
        correctTarget: "c5",
        successText: "Brilliant! The c5 break strikes the base of White's d4-e5 pawn chain.",
        failureText: "Not that square. Black wants to attack the base of White's pawn chain. Look at the c-file.",
        xrayHighlights: {
          chains: [
            ["d4", "e5"],
            ["e6", "d5"]
          ],
          levers: ["c7-c5"]
        }
      }
    ]
  }
];

export const ENDLESS_PUZZLES = [
  {
    fen: "r1bqkb1r/ppp2ppp/2n1p3/3p4/3Pn3/2PBPN2/PP3PPP/RNBQK2R w KQkq - 3 6",
    question: "Click Black's active outpost piece blockading White's pawn expansion.",
    correctTarget: "e4",
    successText: "Correct! The Knight on e4 is in a powerful outpost.",
    failureText: "No, look for the highly active Black piece occupying the hole on e4.",
    xrayHighlights: {
      outposts: ["e4"],
      chains: [
        ["d4", "e3", "f2"],
        ["d5", "e6", "f7"]
      ]
    }
  },
  {
    fen: "rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 2 4",
    question: "Click the pawn which White will challenge with a cxd5 exchange.",
    correctTarget: "d5",
    successText: "Yes! White will trade on d5 to resolve the tension.",
    failureText: "No, look at Black's d-pawn which is under attack by White's c-pawn.",
    xrayHighlights: {
      weaknesses: ["d5"],
      chains: [
        ["c6", "d5"]
      ]
    }
  },
  {
    fen: "r1bqk2r/ppp1bppp/2n1pn2/3p4/3P4/2N2NP1/PPP1PPBP/R1BQK2R w KQkq - 3 6",
    question: "Identify the isolated Queen's pawn.",
    correctTarget: "d4",
    successText: "Correct! The d4 pawn has no friendly pawns on the c or e files.",
    failureText: "Incorrect. Find the pawn on the d-file that has no supporting neighbor pawns.",
    xrayHighlights: {
      weaknesses: ["d4"],
      openFiles: ["c", "e"]
    }
  },
  {
    fen: "r2q1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ2PPP/R1B2RK1 w - - 4 9",
    question: "Click the backward pawn on the c-file.",
    correctTarget: "c6",
    successText: "Correct! The c6 pawn is backward and vulnerable.",
    failureText: "No, look for the pawn on the c-file which has fallen behind its neighbors.",
    xrayHighlights: {
      weaknesses: ["c6"],
      chains: [["d5", "e6", "f7"]]
    }
  },
  {
    fen: "r1bq1rk1/pp2ppbp/2np1np1/8/2BPP3/2N2N2/PP3PPP/R1BQ1RK1 w - - 3 9",
    question: "Click the outpost square d5.",
    correctTarget: "d5",
    successText: "Correct! The d5 square is a powerful outpost blockaded by pawns.",
    failureText: "No, look for the central square directly in front of White's d4 pawn.",
    xrayHighlights: {
      outposts: ["d5"]
    }
  },
  {
    fen: "r1bq1rk1/pp2bppp/2nppn2/8/3NP3/2N5/PPP1BPPP/R1BQ1RK1 w - - 4 9",
    question: "Click the backward d6-pawn which is a constant target.",
    correctTarget: "d6",
    successText: "Correct! The d6 pawn is backward and blocked from advancing.",
    failureText: "No, look at the d-file; the d6 pawn cannot be defended by another pawn.",
    xrayHighlights: {
      weaknesses: ["d6"],
      chains: [["d6", "e6", "f7"]]
    }
  },
  {
    fen: "r1bqk2r/ppp2ppp/2n1pn2/3p4/3P4/2N2NP1/PPP1PPBP/R1BQK2R w KQkq - 3 6",
    question: "Click the blockading square directly in front of the isolated d5 pawn.",
    correctTarget: "d4",
    successText: "Correct! The d4 square is the key blockade point.",
    failureText: "No, look at the square directly in front of Black's isolated d5 pawn.",
    xrayHighlights: {
      outposts: ["d4"]
    }
  },
  {
    fen: "r1bqk2r/pp2bppp/2n1pn2/2pp4/3P4/2N1PN2/PPP1BPPP/R1BQ1RK1 w KQkq - 4 7",
    question: "Click the open c-file where Rooks should be doubled.",
    correctTarget: "c1,c2,c3,c4,c5,c6,c7,c8",
    successText: "Correct! The c-file is the only open file on the board.",
    failureText: "No, look for the file that has no pawns on it.",
    xrayHighlights: {
      openFiles: ["c"]
    }
  },
  {
    fen: "r1b1k2r/ppq1bppp/2nppn2/8/3NP3/1BP5/PP3PPP/RNBQ1RK1 w kq - 3 9",
    question: "Click the outpost square on b5 where a white piece can jump to attack c7.",
    correctTarget: "b5",
    successText: "Correct! The b5 square is a key outpost hole.",
    failureText: "No, look for the b-file square in Black's territory that pawns can't attack.",
    xrayHighlights: {
      outposts: ["b5"]
    }
  },
  {
    fen: "rnbqk2r/pp3ppp/2p1pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 2 6",
    question: "Identify and click the backward pawn on c6.",
    correctTarget: "c6",
    successText: "Correct! The c6 pawn is backward and a major weakness.",
    failureText: "No, look on the c-file for the pawn that has fallen behind its d5 neighbor.",
    xrayHighlights: {
      weaknesses: ["c6"]
    }
  },
  {
    fen: "r1bq1rk1/pppnppbp/3p1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQK2R w KQ - 4 7",
    question: "Click the square where Black will strike with an e5 pawn lever.",
    correctTarget: "e5",
    successText: "Correct! Black wants to strike the center with e7-e5.",
    failureText: "No, look at the square on the e-file that Black's pawn on d6 can support.",
    xrayHighlights: {
      levers: ["e7-e5"]
    }
  },
  {
    fen: "r1bq1rk1/1pp1bppp/p1np1n2/4p3/3PP3/2N2N2/PPP1BPPP/R1BQR1K1 w - - 0 8",
    question: "Click the square where White can make a central pawn break with d5.",
    correctTarget: "d5",
    successText: "Correct! The d4-d5 push gains space and challenges the Knight.",
    failureText: "No, look at the square on the d-file that White's d4 pawn can push into.",
    xrayHighlights: {
      levers: ["d4-d5"]
    }
  },
  {
    fen: "r2q1rk1/pp2bppp/1np1pn2/8/2PP4/2N1PN2/P1Q2PPP/1RB2RK1 w - - 5 12",
    question: "Identify and click the backward c6 pawn.",
    correctTarget: "c6",
    successText: "Correct! The c6 pawn on the semi-open file is backward.",
    failureText: "No, look for the black pawn on the c-file that can no longer be protected by a pawn.",
    xrayHighlights: {
      weaknesses: ["c6"]
    }
  },
  {
    fen: "r1bq1rk1/pp1nbppp/2p1pn2/3p4/2PP4/2N1PN2/PPQ1BPPP/1RR3K1 w - - 0 1",
    question: "Click the open c-file to dominate vertical files.",
    correctTarget: "c1,c2,c3,c4,c5,c6,c7,c8",
    successText: "Correct! Rooks should be placed on the open c-file.",
    failureText: "No, look for the file that has no pawns on it.",
    xrayHighlights: {
      openFiles: ["c"]
    }
  },
  {
    fen: "r1bq1rk1/4bppp/p1nppn2/1p6/3PP3/2N2N2/PPB1QPPP/R1BR2K1 w - - 0 12",
    question: "Click the square where White targets a central break with e5.",
    correctTarget: "e5",
    successText: "Correct! The e4-e5 push opens lines for attack.",
    failureText: "No, look at the square directly in front of White's e4 pawn.",
    xrayHighlights: {
      levers: ["e4-e5"]
    }
  },
  {
    fen: "r1bqk2r/pp2bppp/2n1pn2/2pp4/3P4/2NBP3/PPP2PPP/R1BQK1NR w KQkq - 4 7",
    question: "Identify the square where Black should strike white's center with a c5 pawn lever.",
    correctTarget: "c5",
    successText: "Correct! The c5 break challenges White's d4 pawn.",
    failureText: "No, look at the c-file square where Black's c7 pawn can strike White's center.",
    xrayHighlights: {
      levers: ["c7-c5"]
    }
  },
  {
    fen: "r1b2rk1/ppqnbppp/2p1pn2/3p4/1P1P4/2N1PN2/P1Q1BPPP/1RR3K1 w - - 0 1",
    question: "Identify the square where White will push the b4 pawn to b5.",
    correctTarget: "b5",
    successText: "Correct! Pushing b4-b5 initiates the minority attack.",
    failureText: "No, look at the square on the b-file where the b4 pawn can advance to challenge c6.",
    xrayHighlights: {
      levers: ["b4-b5"]
    }
  }
];
