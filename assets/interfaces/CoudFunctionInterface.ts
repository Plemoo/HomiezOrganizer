export interface CloudFunctionInterface {
    title: string;
    body: string;
    data:{
        type:"newActivity" | "newComment"|"activityScheduled"|"activityCancelled"|"newTimeslot";
        params: {
            groupIdParameter: string;
            activityIdParameter: string;
        };
    }
}