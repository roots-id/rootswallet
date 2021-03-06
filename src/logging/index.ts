export function logger(...args: any) {
    const samples = getSampled(...args);
    console.log(...samples);
}

export function warn(...args: any) {
    const samples = getSampled(...args);
    console.warn(...samples);
}

function getSampled(...args: any): string[] {
    let samples: string[] = []
    if(args.length > 0) {
        const samples: string[] = [];
        args.forEach((arg: any) => {
            const splitArgs = String(arg).split(" ");
            splitArgs.forEach(splitArg => {
                const sampled = splitArg.length > 75;
                const sampleArg = splitArg.substring(0,75);
                samples.push(sampleArg);
                if(sampled) {samples.push("...");}
            });
        })
        return (samples);
    }
    return samples;
}