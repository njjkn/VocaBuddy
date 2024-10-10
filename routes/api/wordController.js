const express = require('express')
const router = express.Router();
const User = require("../../models/User");
const Word = require("../../models/Word");
const ObjectID = require("mongodb").ObjectId;
const handleError = require('../../utils/errorHandler')
const {decryptData, encryptData, decryptObjectData} = require('../../utils/authUtils');
const axios = require('axios');

const dictKey = process.env.DICTIONARY_KEY

function extractVisSentences(response) {
    // Initialize an array to hold the sample sentences
    const sentences = [];

    // Check if the 'def' property exists
    var item = response
    if (item.def && Array.isArray(item.def)) {
        // Iterate through the definitions
        item.def.forEach(def => {
            // Check if the 'sseq' property exists
            if (def.sseq && Array.isArray(def.sseq)) {
                // Iterate through the 'sseq' array
                def.sseq.forEach(sseqItem => {
                    // Iterate through each 'sense' in 'sseqItem'
                    sseqItem.forEach(sense => {
                        // Check if the second element of the 'sense' array is an object and has the 'dt' property
                        if (Array.isArray(sense) && sense[1] && sense[1].dt) {
                            // Iterate through the 'dt' array to find 'vis'
                            sense[1].dt.forEach(dtItem => {
                                // Check if 'dtItem' is an array with 'vis' as the first element
                                if (Array.isArray(dtItem) && dtItem[0] === 'vis') {
                                    // Iterate through the array of sentences
                                    dtItem[1].forEach(visItem => {
                                        // Add the sentence text to the 'sentences' array
                                        sentences.push(visItem.t);
                                    });
                                }
                            });
                        }
                    });
                });
            }
        });
    }

    // Return the collected sentences
    return sentences;
}

function replaceItTagsWithBold(sampleSentence) {
    // Use the map function to iterate over each sentence in the array
    return sampleSentence.map(sentence => {
        // Replace all occurrences of {it} with <bold> and {/it} with </bold>
        return sentence.replace(/\{it\}/g, "<bold>").replace(/\{\/it\}/g, "</bold>");
    });
}

router.post("/:word/:email", async (req, res) => {
    try {
        var wordStr = req.params.word
        const userEmail = req.params.email;
        const user = await User.findOne({email: userEmail})
        const userId = user._id;
        if (user) {
            var word = await Word.findOne({word : wordStr})
            if (word) {
                if (word.userIds.includes(userId)) {
                    return res.status(400).json({ error: "Word already included in user's vocab set" })
                } else {
                    var wordQuery = {word : wordStr}
                    var wordUsers = word.userIds
                    wordUsers.push(userId)
                    wordUpdatedValues = {
                        word: word.word,
                        shortDef: word.shortDef,
                        syns: word.syns,
                        ants: word.ants,
                        form: word.form,
                        userIds: wordUsers,
                        sampleSentences: word.sampleSentences
                    }
                    await Word.findOneAndUpdate(wordQuery, wordUpdatedValues);
                    const vocabSet = await Word.find({ userIds: { $in: [userId] } })
                    return res.status(200).json({ message: "Word has been added to the user's vocab set", vocabSet: vocabSet })
                }
            } else {
                var returnWords = await axios.get(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${wordStr}?key=${dictKey}`);
                returnWords = returnWords.data

                const matchingJsonObject = returnWords.find(item => item.meta.id === wordStr);
                if (matchingJsonObject) {
                    var newWord = {}
                    newWord.word = wordStr
                    newWord.shortDef = matchingJsonObject.shortdef
                    newWord.syns = matchingJsonObject.meta.syns
                    newWord.ants = matchingJsonObject.meta.ants
                    newWord.form = matchingJsonObject.fl
                    visArr = extractVisSentences(matchingJsonObject)
                    visArr = replaceItTagsWithBold(visArr)
                    newWord.sampleSentence = visArr
                    arr = []
                    arr.push(userId)
                    newWord.userIds = arr
                    const newWordDoc = new Word(newWord)
                    await newWordDoc.save()
                    const vocabSet = await Word.find({ userIds: { $in: [userId] } })
                    return res.status(200).json({ message: "A new word has been created and added to the user's vocab set", vocabSet: vocabSet })
                } else {
                    // gpt logic and if gpt gives back 200 you not only create the word document in mongodb but you also send back 200
                    return res.status(400).json({ error:"There is no matching word" })
                }
            }
        } else {
            return res.status(404).json({ error: "User not found" });
        }
    } catch(error) {
        handleError(error, res)
    }
})

router.put("/remove/:word/:email", async(req, res) => {
    try {
        const userEmail = req.params.email;
        const user = await User.findOne({email: userEmail})
        const userId = user._id;
        
        if (!ObjectID.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        if (user) {
            const word = await Word.findOne({word : req.params.word})
            if (word) {
                if (word.userIds.includes(userId)) {
                    var wordUsers = word.userIds
                    wordUsers.remove(userId)
                    var wordQuery = {word : req.params.word}
                    wordUpdatedValues = {
                        word: word.word,
                        shortDef: word.shortDef,
                        syns: word.syns,
                        ants: word.ants,
                        form: word.form,
                        userIds: wordUsers,
                        sampleSentences: word.sampleSentences
                    }
                    await Word.findOneAndUpdate(wordQuery, wordUpdatedValues);
                    const vocabSet = await Word.find({ userIds: { $in: [userId] } })
                    return res.status(200).json({ message: "The word has successfully been removed from the user's vocab set", vocabSet: vocabSet })
                } else {
                    return res.status(404).json({ error: "User not found within the word's userIds list" })
                }
            } else {
                return res.status(404).json({ error: "Word not found" })
            }
        } else {
            return res.status(404).json({ error: "User not found" })
        }
    } catch(error) {
        handleError(error, res)
    }
})

router.get("/fetch/words/:email", async (req, res) => {
    try {
        
        const userEmail = req.params.email;
        
        const user = await User.findOne({ email: userEmail });
        
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        
        const userId = user._id;
        
        if (!ObjectID.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        const wordList = await Word.find({ userIds: userId }).exec();
        
        return res.status(200).json(wordList);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred" });
    }
});

module.exports = router;