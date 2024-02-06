import { createContext } from "react";

export const TraderProfile = () => {
    getTraderProfile().then((result) => {
        return result;
    });
    return JSON.parse(localStorage.getItem("DefaultTraderProfile"));
}

export async function getProfileData() {
    const username = localStorage.getItem("DefaultTraderProfile") === null ? "NoProfile" : JSON.parse(localStorage.getItem("DefaultTraderProfile")).username;
    const response = await fetch(`https://profile-server-zjwgc.ondigitalocean.app/profile/`+username.toString());
    const data = await response.json();
    if (data.error) {
        return "NoProfile";
    } else {
        return data;
    }
}

async function getTraderProfile() {
    const profile = localStorage.getItem("DefaultTraderProfile") !== null ? JSON.parse(localStorage.getItem("DefaultTraderProfile")) : {};
    let isProfileChanged = false;
    if (!profile.username) {
        profile.username = await generateUsername();
        isProfileChanged = true;
    }
    if (!profile.profilePicture) {
        profile.profilePicture = await getRandomCatgirl();
        isProfileChanged = true;
    }
    if (!profile.description) {
        profile.description = "Hi, I am " + profile.username + ".";
        isProfileChanged = true;
    }
    if (isProfileChanged) {
        localStorage.setItem("DefaultTraderProfile", JSON.stringify(profile));
    }
    return profile;
}

async function generateUsername() {
    const adjectives = ['dashing', 'equal', 'smug', 'weighty', 'huge', 'prickly', 'grim', 'vast', 'inner', 'safe', 'ancient', 'puzzling', 'little', 'some', 'unable', 'steep', 'feline', 'any', 'liquid', 'mad', 'wary', 'grand', 'rich', 'lined', 'giant', 'one', 'chubby', 'poised', 'giddy', 'brisk', 'long', 'fast', 'creamy', 'square', 'living', 'needy', 'bony', 'mixed', 'crisp', 'tough', 'linear', 'cute', 'half', 'regal', 'shaky', 'feisty', 'foamy', 'squeaky', 'unruly', 'lethal', 'glass', 'wobbly', 'crazy', 'brief', 'asleep', 'silver', 'silly', 'rotten', 'greedy', 'urban', 'wavy', 'earthy', 'red', 'plastic', 'evil', 'bogus', 'stained', 'joyful', 'huge', 'tiny', 'guilty', 'unfit', 'slow', 'shady', 'large', 'original', 'original', 'true', 'candid', 'natural', 'used', 'steel', 'fragile', 'curvy', 'frozen', 'metallic', 'loose', 'gentle', 'boring', 'sedate', 'healthy', 'spicy', 'spotty', 'secret', 'frantic', 'dry', 'numb', 'salty', 'curved', 'acidic', 'cruel', 'unripe', 'rubbery', 'soupy', 'showy', 'lewd', 'icy', 'vain', 'fertile', 'godly', 'sparse', 'swift', 'caring', 'itchy', 'young', 'elfin', 'lean', 'pushy']

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNumber = Math.floor(Math.random() * 10000) + 1;

    return adjective + "Trader" + randomNumber.toString();
}

async function getRandomCatgirl() {
    const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=AIzaSyBiPxAr2gmWpR4d9Vxt_tZaeIJf-XH0jn4&cx=e0f354ced324a40e9&q=anime+catgirl+profile+picture&searchType=image&start=${Math.floor(Math.random() * 180)}`);
    const data = await response.json();
    const image = data.items[0];
    return image.link;
}

export const ProfileContext = createContext();