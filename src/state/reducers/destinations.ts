import type {Media} from "../../api/types.d";
import { ActionMap, makeAction } from "./common";
import {Destination} from "../../api/types.d";


export type DestinationsStateType = {
    configuredMedia: Media[];
    knownMediaTypes: Media["slug"][]; // derived from configured media

    destinations: Map<Media["slug"], Destination[]> // all users destinations mapped after media type
};

export enum DestinationsType {
    FetchConfiguredMedia = "FETCH_MEDIA",

    LoadDestinations = "GET_DESTINATIONS",
    ModifyDestination = "PATCH_DESTINATION",
    CreateDestination = "POST_DESTINATION",
    DeleteDestination = "DELETE_DESTINATION",
}

type DestinationsPayload = {
    [DestinationsType.FetchConfiguredMedia]: Media[];

    [DestinationsType.LoadDestinations]: Destination[];
    [DestinationsType.ModifyDestination]: Destination;
    [DestinationsType.CreateDestination]: Destination;
    [DestinationsType.DeleteDestination]: Destination;
};

export const initialDestinationsState: DestinationsStateType = {
    configuredMedia: [],
    knownMediaTypes: [],

    destinations: new Map<Media["slug"], Destination[]>(),
};

export type DestinationsActions = ActionMap<DestinationsPayload>[keyof ActionMap<DestinationsPayload>];
export const destinationsReducer = (state: DestinationsStateType, action: DestinationsActions) => {

    // Helpers
    const mapMediaToMediaTypes = (configuredMedia: Media[]): Media["slug"][] => {
        return configuredMedia.map((media) => {
            return media.slug
        })
    };

    const mapDestinationsAfterMediaType = (destinations: Destination[], knownMediaTypes: Media["slug"][]): Map<Media["slug"], Destination[]> => {
        const destinationByKnownTypes = new Map<string, Destination[]>()
        knownMediaTypes.forEach((m) => {
            destinationByKnownTypes.set(m, destinations.filter((dest) => dest.media.slug === m));
        })
        return destinationByKnownTypes;
    }

    const addDestination = (existingDestinations: Map<Media["slug"], Destination[]>, newDestination: Destination): Map<Media["slug"], Destination[]> => {
        const destinationByKnownTypes = new Map<string, Destination[]>(existingDestinations);
        if (existingDestinations.entries() !== undefined && existingDestinations.get(newDestination.media.slug) !== undefined) {
            // @ts-ignore
            destinationByKnownTypes.set(newDestination.media.slug, [...existingDestinations?.get(newDestination.media.slug), newDestination])
        }
        return destinationByKnownTypes;
    }

    const updateDestination = (existingDestinations: Map<Media["slug"], Destination[]>, updatedDestination: Destination): Map<Media["slug"], Destination[]> => {
        const destinationByKnownTypes = new Map<string, Destination[]>(existingDestinations);
        if (existingDestinations.entries() !== undefined && existingDestinations.get(updatedDestination.media.slug) !== undefined) {
            // @ts-ignore
            destinationByKnownTypes.set(updatedDestination.media.slug, [...existingDestinations?.get(updatedDestination.media.slug)])
        }
        return destinationByKnownTypes;
    }

    const deleteDestination = (existingDestinations: Map<Media["slug"], Destination[]>, deletedDestinationEntry: Destination): Map<Media["slug"], Destination[]> => {
        const destinationByKnownTypes = new Map<string, Destination[]>(existingDestinations);
        if (existingDestinations.entries() !== undefined && existingDestinations.get(deletedDestinationEntry.media.slug) !== undefined) {
            // @ts-ignore
            destinationByKnownTypes.set(deletedDestinationEntry.media.slug, [...existingDestinations?.get(deletedDestinationEntry.media.slug).filter(e => e.pk !== deletedDestinationEntry.pk)])
        }
        return destinationByKnownTypes;
    }


    switch (action.type) {
        case DestinationsType.FetchConfiguredMedia:
            return {...state,
                configuredMedia: action.payload,
                knownMediaTypes: mapMediaToMediaTypes(action.payload),
            };
        case DestinationsType.LoadDestinations:
            return {...state,
                destinations: mapDestinationsAfterMediaType(action.payload, state.knownMediaTypes),
            };
        case DestinationsType.CreateDestination:
            return {...state,
                destinations: addDestination(state.destinations, action.payload),
            };
        case DestinationsType.ModifyDestination:
            return {...state,
                destinations: updateDestination(state.destinations, action.payload),
            };
        case DestinationsType.DeleteDestination:
            return {...state,
                destinations: deleteDestination(state.destinations, action.payload),
            };
        default:
            return {...state};
    }
};

export const fetchConfiguredMedia = makeAction<DestinationsType.FetchConfiguredMedia, Media[]>(DestinationsType.FetchConfiguredMedia);
export const loadDestinations = makeAction<DestinationsType.LoadDestinations, Destination[]>(DestinationsType.LoadDestinations);
export const modifyDestination = makeAction<DestinationsType.ModifyDestination, Destination>(DestinationsType.ModifyDestination);
export const createDestination = makeAction<DestinationsType.CreateDestination, Destination>(DestinationsType.CreateDestination);
export const deleteDestination = makeAction<DestinationsType.DeleteDestination, Destination>(DestinationsType.DeleteDestination);
