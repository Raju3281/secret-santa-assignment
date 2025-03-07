export const removeDuplicateGivers=(arr)=> {
    const uniqueGivers = new Map();
  
    arr.forEach(obj => {
        if (!uniqueGivers.has(obj.giverName)) {
            uniqueGivers.set(obj.giverName, obj);
        }
    });
  
    return Array.from(uniqueGivers.values());
  }

export const assignSecretSanta=(participants, lastYearPairs)=>{
    let receivers = [...participants]; 
    let assignments = [];

    function isValidPair(giver, receiver) {
        if (giver === receiver) return false; // Avoid self-assignment

        // Avoid last year's pair
        return !lastYearPairs.some(
            (pair) => pair.giver === giver && pair.receiver === receiver
        );
    }

    let attempts = 0;
    let maxAttempts = 500; // to prevent infinite loops

    while (attempts < maxAttempts) {
        receivers = [...participants].sort(() => Math.random() - 0.5); // Shuffle

        let isValid = true;
        assignments = [];

        for (let i = 0; i < participants.length; i++) {
            let giver = participants[i];
            let receiver = receivers[i];

            if (!isValidPair(giver, receiver)) {
                isValid = false;
                break;
            }
            assignments.push({
              giverName: giver.name,
              giverEmail: giver.email,
              receiverName: receiver.name,
              receiverEmail: receiver.email,
            });
        }

        if (isValid) break; // Found a valid set

        attempts++;
    }

    if (attempts === maxAttempts) {
        throw new Error("Couldn't find a valid assignment. Try again.");
    }

    return assignments;
}