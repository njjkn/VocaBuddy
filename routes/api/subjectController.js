const express = require('express')
const router = express.Router();
const Subject = require("../../models/Subject")
const {decryptData, encryptData, decryptObjectData} = require('../../utils/authUtils')
const ObjectID = require("mongodb").ObjectId;
const handleError = require('../../utils/errorHandler')

/*
This API method will fetch ALL subjects.
*/
router.get("/all", async (req, res) => {
    try {
        // Directly fetch subjects from the database to avoid cache issues for debugging
        const allSubjects = await Subject.find({ isProduction: true }).sort({ subjectPriority: 1 });

        // Log the sorted subjects for verification
        console.log("Sorted subjects by subjectPriority (ascending):", allSubjects.map(subject => ({
            name: subject.name,
            subjectPriority: subject.subjectPriority
        })));

        // Check if subjects are empty, not if the object itself is null or undefined
        if (allSubjects && allSubjects.length > 0) {
            const encryptedData = encryptData(JSON.stringify(allSubjects));
            console.log("Encrypted data:", encryptedData);

            return res.status(200).send(encryptedData);
        } else {
            return res.status(404).json({ error: 'No subjects found' });
        }
    } catch (err) {
        console.log(err);
        handleError(err, res);
    }
});

/*
This API method will fetch a subject after checking if a 
subject with the associated subjectID exists or not.
*/
router.get("/:subjectID", async (req, res) => {
    try {
        const subjectId = req.params.subjectID;
        const decodedSubjectId = decodeURIComponent(subjectId);
        const decryptedSubjectId = decryptData(decodedSubjectId);

        // Validate the ObjectId
        if (!ObjectID.isValid(decryptedSubjectId)) {
            return res.status(400).json({ error: "Invalid subject ID format" });
        }

        const subject = await Subject.findById(new ObjectID(decryptedSubjectId));
        if (!subject) {
            throw new Error("Subject not found");
        }
        // If found, encrypt and send the data
        return res.status(200).json(encryptData(JSON.stringify(subject)));

    } catch (error) {
        console.log(error);
        if (error.message === "Subject not found") {
            return res.status(404).json({ error: "Subject not found" });
        } else {
            handleError(error, res);
        }
    }
});


module.exports = router;