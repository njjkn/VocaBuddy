const Test = require('../models/Test'); 
const TestQuestion = require('../models/TestQuestion'); 
const Section = require('../models/Section'); 
const Concept = require('../models/Concept'); 
const Unit = require('../models/Unit'); 
const UnitCategory = require('../models/UnitCategory'); 
const TestQuestionExplanation = require('../models/TestQuestionExplanation'); 
const SectionTime = require('../models/SectionTime'); 
const ObjectID = require("mongodb").ObjectId;


async function findKeyword(inputString) {
    const keywords = ["sat", "act", "ap", "chapter", "composite"];
    const lowerCaseInput = inputString.toLowerCase();
    for (let keyword of keywords) {
        if (lowerCaseInput.includes(keyword)) {
            return keyword;
        }
    }
    return ""; // Return empty string if no keyword is found
}

async function processConceptsBatch(conceptIds) {
    console.log("Processing batch of concepts:", conceptIds);
    return Promise.all(conceptIds.map(async (conceptObjID) => {
        var conceptDoc = await Concept.findById(new ObjectID(conceptObjID));
        // console.log("Fetched concept:", conceptDoc);
        if (conceptDoc) {
            conceptDoc = conceptDoc.toObject(); // Convert Mongoose document to plain JavaScript object
            delete conceptDoc.description; // Remove the description field
            console.log("Fetched concept:", conceptDoc);
            console.log("skill: ", conceptDoc.skillId);
            console.log("concept id: ", String(conceptDoc._id));
        } else {
            console.log(`Concept with ID ${conceptObjID} is null or undefined.`);
        }
        var mappedUnitCategorytoConcept = await UnitCategory.findById(new ObjectID(conceptDoc.unitCategoryId));
        console.log("Fetched unit category:", mappedUnitCategorytoConcept);

        var customConceptObj = {
            conceptName: conceptDoc.name,
            conceptId: String(conceptDoc._id),
            conceptEncryptedId: String(conceptDoc.encryptedConceptId),
            mappedUnitCategoryId: String(mappedUnitCategorytoConcept._id),
            mappedUnitCategoryIdName: mappedUnitCategorytoConcept.name,
            mappedUnitCategoryTags: mappedUnitCategorytoConcept.categoryTags,
            mappedUnitCategoryDescription: mappedUnitCategorytoConcept.description,
            mappedUnitCategoryUnitId: mappedUnitCategorytoConcept.unitId
        };

        var mappedUnitToConcept = await Unit.findById(new ObjectID(mappedUnitCategorytoConcept.unitId));
        customConceptObj.mappedUnitSubjectId = mappedUnitToConcept.subjectId;
        customConceptObj.mappedUnitName = mappedUnitToConcept.name;
        customConceptObj.mappedUnitDescription = mappedUnitToConcept.description;

        return customConceptObj;
    }));
}


async function processTestQuestionsBatch(questionsBatch) {
    // console.log("Processing batch of questions:", questionsBatch);
    return Promise.all(questionsBatch.map(async (sectionObj) => {
        if (ObjectID.isValid(sectionObj.testQuestionExplanationId)) {
            const testQuestionAnswerExplanation = await TestQuestionExplanation.findById(new ObjectID(sectionObj.testQuestionExplanationId));
            sectionObj.testQuestionAnswerExplanation = testQuestionAnswerExplanation;
        } else {
            sectionObj.testQuestionAnswerExplanation = {}; 
        }
        
        // Batch processing for sectionConceptIdList
        const conceptBatchResults = await processConceptsBatch(sectionObj.conceptIds);
        sectionObj.conceptDocumentsList = conceptBatchResults;

        return sectionObj;
    }));
}

async function constructTestPayloadOptimized(testId) {
    const testDoc = await Test.findById(new ObjectID(testId));

    if (!testDoc) {
        throw new Error("Test not found");
    }

    var testQuestionResponse = {};
    
    if (testDoc) {
        testQuestionResponse.testTitle = testDoc.name;
        testQuestionResponse.testType = await findKeyword(testDoc.testType);
        const testSectionIdsList = testDoc.sectionIds;
        var sectionsList = [];
        var evidenceBasedReadingAndWritingAdaptiveLevel = "";
        var mathAdaptiveLevel = "";

        for (var i = 0; i < testSectionIdsList.length; i++) {
            const sectionObjId = new ObjectID(testSectionIdsList[i]);
            const section = await Section.findById(sectionObjId);
            console.log("this is the section", section);
            if (section) {
                var sectionJSON = {
                    module: section.moduleCount,
                    sectionDirections: section.sectionDirections,
                    sectionDirectionImages: section.sectionDirectionImages,
                    order: section.sectionOrder,
                    difficultyLevel: section.difficultyLevel ? section.difficultyLevel : "Normal",
                    isBreakRoom: section.isBreakRoom ? true : false,
                    sectionTitle: section.sectionTitle
                };

                if (testQuestionResponse.testType === "sat") {
                    if (section.moduleCount === 2) {
                        if (section.sectionTitle === "Evidence-Based Reading and Writing" && 
                            (section.difficultyLevel === "Hard" || section.difficultyLevel === "Easy")) {
                            evidenceBasedReadingAndWritingAdaptiveLevel = 
                                section.sectionTitle + " Module " + section.moduleCount + " Adaptive Level: " + section.difficultyLevel;
                        }

                        if (section.sectionTitle === "Math" && 
                            (section.difficultyLevel === "Hard" || section.difficultyLevel === "Easy")) {
                            mathAdaptiveLevel = 
                                section.sectionTitle + " Module " + section.moduleCount + " Adaptive Level: " + section.difficultyLevel;
                        }
                    }
                }

                const questionsFromTestList = await TestQuestion.find({ section: String(section._id) });
                let sectionQuestions = questionsFromTestList.map(q => q.toJSON());
                sectionQuestions.sort((a, b) => a.number - b.number);

                const batchSize = 5; // Define the batch size
                const batchPromises = [];
                for (let x = 0; x < sectionQuestions.length; x += batchSize) {
                    const batch = sectionQuestions.slice(x, x + batchSize);
                    batchPromises.push(processTestQuestionsBatch(batch));
                }
                const allBatchResults = await Promise.all(batchPromises);
                let updatedSectionQuestionsList = allBatchResults.flat();

                sectionJSON.questions = updatedSectionQuestionsList;
                sectionsList.push(sectionJSON);

                const sectionTimeInSeconds = await SectionTime.find({ sectionId: String(section._id) });
                if (sectionTimeInSeconds && sectionTimeInSeconds.length > 0) {
                    sectionJSON.time = sectionTimeInSeconds[0].timeInTotalSeconds;
                    console.log(sectionJSON.time);
                }
            }
        }
        sectionsList.sort((x, y) => x.order - y.order);
        testQuestionResponse.sections = sectionsList;

        if (evidenceBasedReadingAndWritingAdaptiveLevel) {
            testQuestionResponse.evidenceBasedReadingAndWritingAdaptiveLevel = evidenceBasedReadingAndWritingAdaptiveLevel;
        }
        if (mathAdaptiveLevel) {
            testQuestionResponse.mathAdaptiveLevel = mathAdaptiveLevel;
        }
    }
    return testQuestionResponse;
}

module.exports = {
    constructTestPayloadOptimized
}