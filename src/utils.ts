export const uid = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

// cspell:disable
export const NAMETAKEN = "unnamed_"

export const NONENAMEGIVEN = "IMadeANameForYou_"

export const SpecPrefix = "Spec"

export const usedVariableNames = new Set<string>()
export const variableIndex = new Map<string, number>()

//cspell:enable


export const fileMetaData = {
    date: new Date(),
    components: [
        {

        },
    ]   
}

