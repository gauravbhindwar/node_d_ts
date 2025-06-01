import ejs from 'ejs';
import path from 'path';
import puppeteer from 'puppeteer';
import { folderExistCheck, pdfHeaderPath, timesheetHeaderPdf, timesheetHeaderSeg } from './common.util';

export const pdf = async (
	data: object,
	filename: string,
	folderName: string,
	view: boolean,
	resizeHeaderFooter?: boolean,
	stampLogo?: string | null,
	footerContent?: string,
	footer?: string,
	isTimesheetPdf?: boolean,
	isTimesheetSegment?: boolean,
) => {
	try {
		const isTimesheet = isTimesheetPdf ? isTimesheetPdf : false;
		const browser = await puppeteer.launch({ 
			headless: 'new',
		    args: ['--no-sandbox', '--disable-setuid-sandbox'] });

		const page = await browser.newPage();

		const html = await ejs.renderFile(path.join(__dirname, `../templates/${folderName}.ejs`), {
			data,
			stampLogo,
		});
		await page.setContent(html, { waitUntil: 'domcontentloaded' });
		await page.emulateMediaType('screen');

		const publicFolder = path.join(__dirname, '../../secure-file/');
		folderExistCheck(publicFolder);
		const folderPath = path.join(publicFolder, `${folderName}/`);
		folderExistCheck(folderPath);
		const promise = await Promise.resolve(async () => {
			//
			await browser.close();
		});
		if (promise) {
			// ...
		}
		await page.setViewport({ width: 1680, height: 1050 });
		let headerTemplate: string = null;
		let watermark = null;
		if (!resizeHeaderFooter) {
			headerTemplate = `<div style="width:100%; margin:-18px auto 0;"><img style='width:100%;max-width:100%;'
			 src="${pdfHeaderPath}" /></div>`;
		} else if (isTimesheetSegment) {
			headerTemplate = `<div style="width:100%;">
				<div style="position: absolute; width: 250px ; top: 10px; left: 0px;">
					<img style='width:250px;max-width:100%; margin-left: 60px;'
					src="${timesheetHeaderPdf}" />
				</div>
				<div style="display: flex; margin-bottom: 10px;justify-content: center; align-items: center;">${timesheetHeaderSeg(
					data,
				)}</div>
			 </div>
			 `;
		} else {
			headerTemplate = '';
		}

		if (isTimesheetSegment) {
			watermark = `<div class="watermark-wrapper"
				style="position: absolute; width: 80%; top: 50%; transform: translateY(-50%); left: 10%; right: 10%; opacity: 0.07; z-index: -1;">
				<img src="${timesheetHeaderPdf}"
				alt="" style="width: 100%; max-width: 100%;">
				</div>`;
		}
		await page.pdf({
			format: isTimesheet ? 'A3' : 'A4',
			printBackground: true,
			displayHeaderFooter: true,
			headerTemplate,
			footerTemplate: `<div style="width:100%;display:flex;align-items:end;">
			<p style="font-size:${
				isTimesheet ? '10px;' : '12px;'
			} line-height:18px; font-weight:400; padding:0 16px; color: #6B070D; width: 20%!important; max-width:100%;"> ${
				footer ? footer : ''
			} </p> 
			<p style="font-size:${
				isTimesheet ? '10px;' : '12px;'
			} line-height:18px; font-weight:400; padding:0 16px; color: #6B070D;width: 80%!important; max-width:100%; text-align:right;"> ${
				footerContent ? footerContent : ''
			} </p>
			</div>${isTimesheetSegment && watermark}`,
			omitBackground: true,
			landscape: view,
			timeout: 0,
			preferCSSPageSize: true,
			path: `${folderPath}${filename}`,
		});

		// Close the browser instance
		await browser.close();
		return html;
	} catch (error) {
		// eslint-disable-next-line no-console
		console.log(error);
		throw new Error(error);
	}
};
