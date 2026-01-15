import {describe, it, expect} from 'vitest';
import type {GameState, GameActions, UseGameReturn} from '../game';

describe('game types', () => {
  it('GameState has all required properties', () => {
    const gameState: GameState = {
      participants: [],
      revealed: false,
      myVote: undefined,
      votingSystem: 'fibonacci',
      issues: [],
      activeIssueId: undefined,
      notFound: false,
      roomFull: false,
    };

    expect(gameState).toBeDefined();
    expect(gameState.participants).toEqual([]);
    expect(gameState.revealed).toBe(false);
    expect(gameState.votingSystem).toBe('fibonacci');
  });

  it('GameActions has all required methods', () => {
    const gameActions: GameActions = {
      vote() {
        /* no-op */
      },
      reveal() {
        /* no-op */
      },
      reset() {
        /* no-op */
      },
      addIssue() {
        /* no-op */
      },
      removeIssue() {
        /* no-op */
      },
      setActiveIssue() {
        /* no-op */
      },
      voteNextIssue() {
        /* no-op */
      },
      updateIssue() {
        /* no-op */
      },
      removeAllIssues() {
        /* no-op */
      },
      disconnect() {
        /* no-op */
      },
    };

    expect(gameActions.vote).toBeInstanceOf(Function);
    expect(gameActions.reveal).toBeInstanceOf(Function);
    expect(gameActions.disconnect).toBeInstanceOf(Function);
  });

  it('UseGameReturn combines GameState and GameActions', () => {
    const useGameReturn: UseGameReturn = {
      // GameState properties
      participants: [],
      revealed: false,
      myVote: undefined,
      votingSystem: 'fibonacci',
      issues: [],
      activeIssueId: undefined,
      notFound: false,
      roomFull: false,
      // GameActions methods
      vote() {
        /* no-op */
      },
      reveal() {
        /* no-op */
      },
      reset() {
        /* no-op */
      },
      addIssue() {
        /* no-op */
      },
      removeIssue() {
        /* no-op */
      },
      setActiveIssue() {
        /* no-op */
      },
      voteNextIssue() {
        /* no-op */
      },
      updateIssue() {
        /* no-op */
      },
      removeAllIssues() {
        /* no-op */
      },
      disconnect() {
        /* no-op */
      },
    };

    expect(useGameReturn).toBeDefined();
    expect(useGameReturn.participants).toEqual([]);
    expect(useGameReturn.vote).toBeInstanceOf(Function);
  });
});
