export const errorMessages = {
  phone: "Phone number already exist",
  email: "Email address already exist",
  user: "User already exist",
};

export class MessageFormation {
  model: string;
  message: {
    wrong: string;
    value: { model: string };
    custom: string;
    app?: string;
    create?: string;
    assigned?: string;
    update?: string;
    fetch?: string;
    delete?: string;
    exist?: string;
    parentId?: string;
    notFound?: string;
    resentOtp?: string;
    forgot?: string;
    invalidCredentials?: string;
    unauthorizedError?: string;
    authError?: string;
    chatMessageDelete?: string;
    chatMessageUpdate?: string;
    passwordSet?: string;
    otpVerificationSuccess?: string;
    otpSentSuccess?: string;
    passwordChangeSuccess?: string;
    loggInSuccess?: string;
    passwordSetError?: string;
    getLoggInSuccess?: string;
    correctPasswordError?: string;
    pleaseCompleteSubLessons?: string;
    somethingWentWrong?: string;
    sendInformation?: string;
    lessonAssociationWithCourse?: string;
    notAssociatedCourse?: string;
    isMissing?: string;
    tokengenerate?: string;
    answerAssociationWithQuestion?: string;
  };

  constructor(modelData: string) {
    this.model = modelData;
    this.message = {
      wrong: "Something went wrong.",
      app: "App Notification",
      create: "Data created Successfully.",
      assigned: "You are assigned to this task.",
      update: "Data updated Successfully.",
      fetch: "Data fetched Successfully.",
      delete: "Data deleted Successfully.",
      exist: "Data already exist",
      parentId: "Parent user is not active",
      notFound: "Data Not Found",
      resentOtp: "Here is your Resented OTP : ",
      forgot: "Forgot Otp",

      passwordSet: "Password set successfully.",
      otpVerificationSuccess: "Otp Verified successfully",
      otpSentSuccess: "Otp sent successfully",
      authError: "Authentication error",
      chatMessageDelete: "Message Deleted Successfully.",
      chatMessageUpdate: "Message Updated Successfully.",
      passwordChangeSuccess: "Password changed successfully.",
      getLoggInSuccess: "Logged User fetched successfully.",
      loggInSuccess: "User Logged In Successfully.",
      pleaseCompleteSubLessons: "Please complete all the sub lessons",
      passwordSetError: "Password is not set yet.",
      correctPasswordError: "Please enter the correct password.",
      invalidCredentials: "Invalid Credentials",
      unauthorizedError: "Unauthorized",
      somethingWentWrong: "Something wrong Please try again",
      sendInformation: "Your information is being sent to admin.",
      lessonAssociationWithCourse: "Lesson is not associated with courseId",
      answerAssociationWithQuestion: "Answer is not associated with Question",
      notAssociatedCourse: "Data is not associated with courseId",
      isMissing: "Data is Missing",
      tokengenerate: "Token created successfully",
      custom: "",
      set value({ model, custom }: { model: string; custom: string }) {
        this.create = `${model} created successfully.`;
        this.update = `${model} updated successfully.`;
        this.fetch = `${model} fetched successfully.`;
        this.delete = `${model} deleted successfully.`;
        this.assigned = `You are assigned to ${model} task.`;
        this.exist = `${model} already exist.`;
        this.notFound = `${model} not found`;
        this.notAssociatedCourse = `${model} is not associated with courseId`;
        this.isMissing = `${model}  is Missing`;
        this.custom = custom;
      },
    };
    this.setModelValue();
  }

  setModelValue() {
    this.message.value = { model: this.model };
  }

  custom(custom: string) {
    this.message.custom = custom;
    return custom;
  }
}
