import { i18n, i18nFormat } from '../foundryvtt-arms-reach';
import {
  computeDistanceBetweenCoordinates,
  computeDistanceBetweenCoordinatesOLD,
  getCharacterName,
  getFirstPlayerToken,
  getFirstPlayerTokenSelected,
  getTokenByTokenID,
  iteractionFailNotification,
} from './ArmsReachHelper';
import { getCanvas, ARMS_REACH_MODULE_NAME, getGame } from './settings';

export const TilesReach = {
  globalInteractionDistance: function (character: Token, tile: Tile): boolean {
    let isOwned = false;
    if (!character) {
      character = <Token>getFirstPlayerToken();
      if (character) {
        isOwned = true;
      }
    }
    if (!character) {
      if (getGame().user?.isGM) {
        return true;
      } else {
        return false;
      }
    }

    // Sets the global maximum interaction distance
    // OLD SETTING
    let globalInteraction = <number>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance');
    if (globalInteraction <= 0) {
      globalInteraction = <number>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionMeasurement');
    }
    // Global interaction distance control. Replaces prototype function of Stairways. Danger...
    if (globalInteraction > 0) {
      // Check distance
      //let character:Token = getFirstPlayerToken();
      if (
        !getGame().user?.isGM ||
        (getGame().user?.isGM &&
          <boolean>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistanceForGM'))
      ) {
        if (!character) {
          iteractionFailNotification(i18n(`${ARMS_REACH_MODULE_NAME}.noCharacterSelectedForTile`));
          return false;
        } else {
          let isNotNearEnough = false;
          // OLD SETTING
          if (<number>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance') > 0) {
            const dist = computeDistanceBetweenCoordinatesOLD(TilesReach.getTilesCenter(tile), character);
            isNotNearEnough =
              dist > <number>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionDistance');
          } else {
            const dist = computeDistanceBetweenCoordinates(TilesReach.getTilesCenter(tile), character);
            isNotNearEnough =
              dist > <number>getGame().settings.get(ARMS_REACH_MODULE_NAME, 'globalInteractionMeasurement');
          }
          if (isNotNearEnough) {
            const tokenName = getCharacterName(character);
            if (tokenName) {
              iteractionFailNotification(
                i18nFormat(`${ARMS_REACH_MODULE_NAME}.tilesNotInReachFor`, { tokenName: tokenName }),
              );
            } else {
              iteractionFailNotification(i18n(`${ARMS_REACH_MODULE_NAME}.tilesNotInReach`));
            }
            return false;
          } else {
            return true;
          }
        }
      } else if (getGame().user?.isGM) {
        // DO NOTHING
        return true;
      }
    }

    return false;
  },

  getTilesCenter: function (tile: Tile) {
    const drawCenter = { x: tile.x, y: tile.y };
    return drawCenter;
  },
};
