import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from 'config';
import { Twilio } from 'twilio';

const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export const twilioMessages = async (to: string, message: string) => {
	try {
		const twilioMessage = await client.messages.create({
			body: message.replace(/(<([^>]+)>)/gi, ''),
			to: to,
			from: TWILIO_PHONE_NUMBER,
		});
		return { message: 'SMS sent successfully', messageId: twilioMessage.sid };
	} catch (error) {
		throw new Error(error);
	}
};
