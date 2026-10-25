import type { Reporter, TestCase, TestResult, TestStep } from "@playwright/test/reporter";

export type ReportedStep = Pick<TestStep, "title" | "category" | "location" | "error"> & {
	steps: ReportedStep[];
};

export type ReportedTest = {
	title: string;
	status: TestResult["status"];
	errors: TestResult["errors"];
	steps: ReportedStep[];
};

function reportStep(step: TestStep): ReportedStep {
	return {
		title: step.title,
		category: step.category,
		location: step.location,
		error: step.error,
		steps: step.steps.map(reportStep),
	};
}

export default class StackReporter implements Reporter {
	private readonly tests: ReportedTest[] = [];

	onTestEnd(test: TestCase, result: TestResult): void {
		this.tests.push({
			title: test.title,
			status: result.status,
			errors: result.errors,
			steps: result.steps.map(reportStep),
		});
	}

	onEnd(): void {
		process.stdout.write(JSON.stringify(this.tests));
	}
}
