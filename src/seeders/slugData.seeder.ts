import db from '@/models';
import Client from '@/models/client.model';
import Contact from '@/models/contact.model';
import Employee from '@/models/employee.model';
import LoginUser from '@/models/loginUser.model';
import Segment from '@/models/segment.model';
import SubSegment from '@/models/subSegment.model';
import ClientRepo from '@/repository/client.repository';
import ContactRepo from '@/repository/contact.repository';
import EmployeeRepo from '@/repository/employee.repository';
import SegmentRepo from '@/repository/segment.repository';
import SubSegmentRepo from '@/repository/subSegment.repository';
import { createRandomHash, parse } from '@/utils/common.util';
import slugify from 'slugify';

//==============Add Slug on Database Tables(Client, Employee, Segment, Sub-Segment, Employee)=============
(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// For Client Table
		const clientRepo = new ClientRepo();
		let clientData = await clientRepo.getAll({
			where: {
				slug: null,
				deletedAt: null,
			},
			attributes: ['id', 'code'],
			include: [{ model: LoginUser, attributes: ['name'] }],
		});

		clientData = parse(clientData);
		const clientUpdate = [];

		for (const clients of clientData) {
			const slugClient = clients.loginUserData.name + clients.code;
			const slugifyClient = slugify(slugClient, { lower: true, replacement: '-' });
			clientUpdate.push({ slug: slugifyClient, id: clients.id });
		}

		await Promise.all(
			clientUpdate.map((clients) => {
				return Client.update({ slug: clients.slug }, { where: { id: clients.id }, transaction });
			}),
		);

		// For Contact Table

		const contactRepo = new ContactRepo();
		let contactData = await contactRepo.getAll({
			where: {
				slug: null,
				deletedAt: null,
			},
			attributes: ['id', 'email'],
		});
		contactData = parse(contactData);
		const contactUpdate = [];

		for (const contacts of contactData) {
			const slugContact = contacts.name + createRandomHash(5);
			const slugifyContact = slugify(slugContact, { lower: true, replacement: '-' });
			contactUpdate.push({ slug: slugifyContact, id: contacts.id });
		}

		await Promise.all(
			contactUpdate.map((contacts) => {
				return Contact.update({ slug: contacts.slug }, { where: { id: contacts.id }, transaction });
			}),
		);

		// For Segment Table

		const segmentRepo = new SegmentRepo();
		let segmentData = await segmentRepo.getAll({
			where: {
				slug: null,
				deletedAt: null,
			},
			attributes: ['id', 'name', 'code'],
		});
		segmentData = parse(segmentData);
		const segmentsUpdate = [];

		for (const segments of segmentData) {
			const slugSegment = segments.name + segments.code;
			const slugifySegment = slugify(slugSegment, { lower: true, replacement: '-' });
			segmentsUpdate.push({ slug: slugifySegment, id: segments.id });
		}

		await Promise.all(
			segmentsUpdate.map((segments) => {
				return Segment.update({ slug: segments.slug }, { where: { id: segments.id }, transaction });
			}),
		);

		// For Sub-Segment Table

		const subSegmentRepo = new SubSegmentRepo();
		let subSegmentData = await subSegmentRepo.getAll({
			where: {
				slug: null,
				deletedAt: null,
			},
			attributes: ['id', 'name', 'code'],
		});
		subSegmentData = parse(subSegmentData);
		const subSegmentUpdate = [];

		for (const subSegments of subSegmentData) {
			const slugSubSegment = subSegments.name + subSegments.code;
			const slugifySubSegment = slugify(slugSubSegment, { lower: true, replacement: '-' });
			subSegmentUpdate.push({ slug: slugifySubSegment, id: subSegments.id });
		}

		await Promise.all(
			subSegmentUpdate.map((subSegments) => {
				return SubSegment.update({ slug: subSegments.slug }, { where: { id: subSegments.id }, transaction });
			}),
		);

		// For Employee Table
		const employeeRepo = new EmployeeRepo();
		let employeeData = await employeeRepo.getAll({
			where: {
				slug: null,
				deletedAt: null,
			},
			attributes: ['id', 'employeeNumber'],
		});
		employeeData = parse(employeeData);

		const employeeUpdate = [];

		for (const employee of employeeData) {
			const slugEmployee = employee.employeeNumber + createRandomHash(5);
			const slugifyEmployee = slugify(slugEmployee, { lower: true, replacement: '-' });
			employeeUpdate.push({ slug: slugifyEmployee, id: employee.id });
		}

		await Promise.all(
			employeeUpdate.map((employees) => {
				return Employee.update({ slug: employees.slug }, { where: { id: employees.id }, transaction });
			}),
		);
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Slug Added Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
