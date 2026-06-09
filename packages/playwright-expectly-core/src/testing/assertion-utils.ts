export function getRejectedErrorSync(assertion: () => void): Error {
	try {
		assertion();
		return new Error("Expected assertion to reject");
	} catch (error: unknown) {
		if (error instanceof Error) {
			return error;
		}
		return new Error(String(error));
	}
}

export async function getRejectedError(assertion: Promise<unknown>): Promise<Error> {
	try {
		await assertion;
		return new Error("Expected assertion to reject");
	} catch (error: unknown) {
		if (error instanceof Error) {
			return error;
		}
		return new Error(String(error));
	}
}
