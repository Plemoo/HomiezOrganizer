export interface CloudFunctionInterface {
    title: string;
    body: string;
    data:{
        type:"newActivity" | "newComment"|"activityScheduled"|"activityCancelled";
        params: {
            groupIdParameter: string;
            activityIdParameter: string;
        };
    }
}