import db from '@/models';
import Employee from '@/models/employee.model';
import EmployeeSegment from '@/models/employeeSegment.model';
import { parse } from '@/utils/common.util';

//==============Add Slug on Database Tables(Client, Employee, Segment, Sub-Segment, Employee)=============
(async function injectUsers(): Promise<void> {
	return db.transaction(async () => {
		const dataJson = [
			{
				oldEmployeeId: 'FD890D2C-F686-47E1-8637-01E95D9C8D8C',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'C37039CA-4823-46AE-A34A-03E16624A65D',
				oldSegmentId: '79',
				subSegmentId: '9',
			},
			{ oldEmployeeId: 'E544F372-C1A7-4569-A24D-07643FD12CEE', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: 'E544F372-C1A7-4569-A24D-07643FD12CEE',
				oldSegmentId: '74',
				subSegmentId: '26',
			},
			{
				oldEmployeeId: '10921E67-96DF-48DC-856F-0774D14D3D14',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: '8F62613C-14E1-4336-AEF3-07E006D2FEF2',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '74C4BFFD-23B2-4558-9EB8-0BA1B09DC9C9',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '8CAF1379-4980-450F-8055-0DAA97538092',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
			{
				oldEmployeeId: '73254315-EDBC-4541-B5D5-0DB09D37F1C8',
				oldSegmentId: '36',
				subSegmentId: '37',
			},
			{ oldEmployeeId: 'B67B1B2C-0BC4-496E-A382-10F678A5051D', oldSegmentId: '39', subSegmentId: null },
			{
				oldEmployeeId: 'B67B1B2C-0BC4-496E-A382-10F678A5051D',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '640CEC49-1F4A-40C8-8D54-13F7CE9070DD',
				oldSegmentId: '36',
				subSegmentId: '8',
			},
			{
				oldEmployeeId: 'B4E12E60-66C3-4D9A-8F3E-17AC161A73C5',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: 'EB45AF1B-F997-42E6-9D97-17DF35D83269',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: '73E0F6D6-E0A2-429C-9904-18A944F58910',
				oldSegmentId: '36',
				subSegmentId: '8',
			},
			{
				oldEmployeeId: '1B2D67DA-CE0C-4C1B-A687-1AF6D6DB75A1',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '00C244A9-BF65-4B55-85C6-1BCFDE2A98EF',
				oldSegmentId: '7',
				subSegmentId: '19',
			},
			{
				oldEmployeeId: '4DBC6985-A959-4D8C-BE8E-1C3B9D2A9800',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: '4DBC6985-A959-4D8C-BE8E-1C3B9D2A9800',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '224041D4-C314-40C9-A350-1E85B7B56AC2',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '46863A66-9642-4C0A-8295-222897B84FA5',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: 'FA68193A-73DC-48C2-A017-236A8501BDA0',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: '9977937E-2633-4459-9A3F-271BF3A311A4',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
			{
				oldEmployeeId: '8014C913-352D-4DC6-891F-2838BB4EA029',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '41A6F1FC-7D0C-4E97-9521-2A163B27AA04',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: '7D88808C-3B8D-4E8A-A323-2AD19FC14CD0',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: '2C5EA0AF-2A86-4E35-9E07-2AD4247C43FC',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '2C5EA0AF-2A86-4E35-9E07-2AD4247C43FC',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: '4182E172-70FB-44FD-9F92-2DBE819AE1BB',
				oldSegmentId: '40',
				subSegmentId: '41',
			},
			{
				oldEmployeeId: '732DDF50-B94D-40C1-A32A-2EEBC51CE594',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: 'E7450A34-968C-4A82-8BFE-2F49E59B56EC',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
			{
				oldEmployeeId: 'EBFBACE7-0F0E-4873-8A65-355772BB374C',
				oldSegmentId: '7',
				subSegmentId: '33',
			},
			{
				oldEmployeeId: '211E24A3-3B65-4517-A82B-3815A7BC7B1F',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: 'ADC78997-4FB0-484D-8322-3F1C36C64D2D',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'EBCB0EDF-CDA6-4CA6-AC67-3FEFDC5A7CE4',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{
				oldEmployeeId: '9EF2D533-7DA2-41F4-A8A5-4916EAF6426B',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: 'D8291AE9-AAFF-4C2D-BFA4-4C3A139CE3D4',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: 'EFE209DF-10B3-4E04-AD17-4DFE97CE47C7',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '2265E633-FB1A-4500-B1D0-4E88CB391115',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{ oldEmployeeId: '2DFC443E-5CE0-44E8-8C3B-521435395575', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '75A694F4-91EF-41BF-980E-52E35A8E0B8A',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'A55071AF-9BBC-470C-AE50-535DFE6C7852',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: 'A55071AF-9BBC-470C-AE50-535DFE6C7852',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: 'F8508120-52DE-4553-A510-582529F5DF41',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{ oldEmployeeId: 'F8508120-52DE-4553-A510-582529F5DF41', oldSegmentId: '65', subSegmentId: null },
			{
				oldEmployeeId: '988F124A-A5ED-4154-A0DD-5956AD8F82B9',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '0CC958A8-F74B-4A16-AA39-5BAECA54F4C8',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: 'A122FD59-84BC-4E8A-B60D-5FF26472F83F',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{ oldEmployeeId: '0021808E-190D-47E4-AA67-63B34F138905', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '0021808E-190D-47E4-AA67-63B34F138905',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: 'D000A462-645D-4862-B7D2-646395864B78',
				oldSegmentId: '36',
				subSegmentId: '5',
			},
			{
				oldEmployeeId: 'D5F3E911-D13B-4974-987A-66E55F5D61C2',
				oldSegmentId: '7',
				subSegmentId: '30',
			},
			{
				oldEmployeeId: '8B3CBBC3-2DDF-4025-8B74-68A84BF6E0D7',
				oldSegmentId: '7',
				subSegmentId: '33',
			},
			{
				oldEmployeeId: '7D7BA6AC-52E0-4D65-A03E-690A2AB569B0',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: 'A18EFB88-5817-4006-B653-6A596B8ADCBA',
				oldSegmentId: '107',
				subSegmentId: '3',
			},
			{
				oldEmployeeId: 'B85FD6C7-E979-4AF1-9272-6C1E5533EF85',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: 'B85FD6C7-E979-4AF1-9272-6C1E5533EF85',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{
				oldEmployeeId: 'CECD378F-84E6-4BA6-AD77-6D5DE6493E94',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: '0F615818-D84E-4248-8106-6E7BCC5C3F8F',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{
				oldEmployeeId: '792DD1CF-1CC6-4609-81BF-6EB1FD7EDE15',
				oldSegmentId: '45',
				subSegmentId: '32',
			},
			{
				oldEmployeeId: 'FB93DA7A-FAA6-4F68-A262-71433816B1F9',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: '6F3936A3-E99B-4102-969F-7872F601EB0E',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '1E212C88-4813-4CE6-A40D-7B983B30D012',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'F807723A-9249-4A2E-A182-80ABC67F066C',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
			{
				oldEmployeeId: '5F946001-C840-40A6-80A3-88A1AB4590D6',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: '5F946001-C840-40A6-80A3-88A1AB4590D6',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '028D1C23-5271-4130-A48E-8AC5497388D6',
				oldSegmentId: '6',
				subSegmentId: '16',
			},
			{
				oldEmployeeId: '8A5D6593-20A1-4A41-85F8-91A992824063',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: 'F4A807F3-B30D-4F2E-888A-9FF596A1E2B6',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '644EB8CE-E381-49D2-ACED-A19CE9AA6999',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{ oldEmployeeId: '0DE493C3-A39C-4230-871B-A33C7381CCEF', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: 'D449B021-2807-4D8F-A406-A536CE74DCC5',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{
				oldEmployeeId: 'D449B021-2807-4D8F-A406-A536CE74DCC5',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '2983BB7B-1BE5-4321-AF6E-A88112734128',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '44081079-1D7A-4A6C-ADB8-A916BB92F9C3',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '41D87710-31CF-4853-A41E-A9EC3AC05A67',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '5CA9F0DF-3ECD-4A6A-B4CB-AD1F40FD765A',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{ oldEmployeeId: '5CA9F0DF-3ECD-4A6A-B4CB-AD1F40FD765A', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '5CA9F0DF-3ECD-4A6A-B4CB-AD1F40FD765A',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{ oldEmployeeId: '88D26720-5073-4F98-ACC4-AD93C89161BC', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '88D26720-5073-4F98-ACC4-AD93C89161BC',
				oldSegmentId: '74',
				subSegmentId: '26',
			},
			{
				oldEmployeeId: 'A27D1164-6A77-46CC-B8A0-B1B8E9AA0C70',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{
				oldEmployeeId: 'AAC14A9D-EB2E-4016-A39D-B2208AF76F1C',
				oldSegmentId: '36',
				subSegmentId: '8',
			},
			{
				oldEmployeeId: 'A322A05F-8137-4387-A74B-B25A5C5804F8',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '5DFEF995-C68B-45B4-B503-B59BAB25B276',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: '612B0A51-5E1E-44D9-9788-B5AFA4869403',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{
				oldEmployeeId: '7989E352-3F2A-460D-81D6-BA87D6E3C288',
				oldSegmentId: '107',
				subSegmentId: '3',
			},
			{
				oldEmployeeId: 'B9E50883-B46E-4106-AFC2-BD80390807E9',
				oldSegmentId: '107',
				subSegmentId: '3',
			},
			{
				oldEmployeeId: 'B9E50883-B46E-4106-AFC2-BD80390807E9',
				oldSegmentId: '45',
				subSegmentId: '36',
			},
			{
				oldEmployeeId: 'C834D6EB-B02C-4EC5-B67D-C0CC37A5C12F',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: '930E9A74-D4BE-43DA-B227-C144AD256CBB',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{ oldEmployeeId: '8F4050DE-9952-4721-B871-C6620165660E', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '8F4050DE-9952-4721-B871-C6620165660E',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: '6F5A17E8-1460-436B-9C35-C6A2087368D8',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{ oldEmployeeId: '92BD1FD5-785C-4DDD-A6A5-C6E9C4C21D89', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '6487FC6E-8A64-439F-9798-D02CC5FC067D',
				oldSegmentId: '79',
				subSegmentId: '9',
			},
			{
				oldEmployeeId: '1770DBDB-94CD-4980-ADB3-D89CF4E0375B',
				oldSegmentId: '7',
				subSegmentId: '30',
			},
			{ oldEmployeeId: '9FB759F5-8C02-4659-9A9C-DAB03258ADBB', oldSegmentId: '56', subSegmentId: null },
			{
				oldEmployeeId: '73FEFD85-DFB9-4C84-AF81-DAE7CE6E7EF3',
				oldSegmentId: '36',
				subSegmentId: '8',
			},
			{
				oldEmployeeId: 'A0873B08-8621-46A4-8A22-DC1DD0ED3F18',
				oldSegmentId: '40',
				subSegmentId: '41',
			},
			{
				oldEmployeeId: '3CC4EAEA-805D-44DB-82F0-DE5DB705DE11',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{ oldEmployeeId: '44B986F4-C060-470F-87E5-E31542FDC5CA', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: 'B1399820-CDB4-4BAC-8568-E39D34DBDA02',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: 'DF02A553-F8E1-4C69-AA38-E3EE0C1DAB6E',
				oldSegmentId: '79',
				subSegmentId: '40',
			},
			{
				oldEmployeeId: '6F2818CD-36A7-45EF-BD62-E43B231C58C6',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{ oldEmployeeId: '8E11027A-DEDC-43B7-A8D2-E4EEA7A6FD31', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '8E11027A-DEDC-43B7-A8D2-E4EEA7A6FD31',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{ oldEmployeeId: '8E11027A-DEDC-43B7-A8D2-E4EEA7A6FD31', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: 'EC784127-D1A7-407E-9436-E5F0E3F9ED9F',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
			{
				oldEmployeeId: 'F51A7FB6-515C-461E-A815-E670371A5786',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '8BB2F721-1511-4C1D-96C6-E825CF6C9FF4',
				oldSegmentId: '36',
				subSegmentId: '13',
			},
			{
				oldEmployeeId: '8BB2F721-1511-4C1D-96C6-E825CF6C9FF4',
				oldSegmentId: '36',
				subSegmentId: '5',
			},
			{
				oldEmployeeId: 'EF7BF2E7-172A-4120-B093-E941D7FCCD79',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: '06B3EABF-2CFC-4C9D-B134-E966ABCEB14A',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '6559CB9E-17F5-4498-A028-EADB6E7BD924',
				oldSegmentId: '7',
				subSegmentId: '30',
			},
			{
				oldEmployeeId: 'A47A7B13-B82F-4AD1-8EE5-EB32EC6B4F93',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: '465449D4-B7D0-4FBB-ACB1-EBDB671CD52E',
				oldSegmentId: '34',
				subSegmentId: '14',
			},
			{
				oldEmployeeId: '465449D4-B7D0-4FBB-ACB1-EBDB671CD52E',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{
				oldEmployeeId: 'F5B4E3C3-3D6C-41CC-84DE-ED058FA80B8A',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{
				oldEmployeeId: 'AA2045FB-6263-4BC9-9684-EE9890C44422',
				oldSegmentId: '34',
				subSegmentId: '15',
			},
			{
				oldEmployeeId: '7F0918C6-2BBE-4BE0-A0DD-EF76C2916B8A',
				oldSegmentId: '79',
				subSegmentId: '9',
			},
			{
				oldEmployeeId: '7F0918C6-2BBE-4BE0-A0DD-EF76C2916B8A',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: '7298655A-9158-42E9-AF9E-F1B609673713',
				oldSegmentId: '74',
				subSegmentId: '26',
			},
			{ oldEmployeeId: '7298655A-9158-42E9-AF9E-F1B609673713', oldSegmentId: '84', subSegmentId: null },
			{
				oldEmployeeId: '35EEB471-5C9A-4266-9C47-F1CE335014D3',
				oldSegmentId: '40',
				subSegmentId: '41',
			},
			{
				oldEmployeeId: '9115FB97-2628-4C67-9F79-F203806B88EC',
				oldSegmentId: '107',
				subSegmentId: '7',
			},
			{
				oldEmployeeId: '9E7D3343-583B-4DA0-8087-F4D5198FE258',
				oldSegmentId: '107',
				subSegmentId: '1',
			},
			{
				oldEmployeeId: 'D807335B-B9D3-43D1-957C-F8C129E2612B',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'AE841E28-1323-4C93-B63F-F92D070D6D8B',
				oldSegmentId: '45',
				subSegmentId: '44',
			},
			{
				oldEmployeeId: 'CEF78B63-01D3-4A35-A7B0-FA169FDA0531',
				oldSegmentId: '79',
				subSegmentId: '35',
			},
			{
				oldEmployeeId: 'B124140A-EA79-4863-88B2-FAE5B018ABDF',
				oldSegmentId: '40',
				subSegmentId: '43',
			},
			{
				oldEmployeeId: '7F111DD1-095A-4551-BB1B-FC31B07AF1CC',
				oldSegmentId: '79',
				subSegmentId: '4',
			},
			{
				oldEmployeeId: '7F111DD1-095A-4551-BB1B-FC31B07AF1CC',
				oldSegmentId: '79',
				subSegmentId: '25',
			},
			{
				oldEmployeeId: '815C7AF2-5D26-4801-BD73-FFBA08F64F90',
				oldSegmentId: '107',
				subSegmentId: '34',
			},
		];
		const errorData = [];
		const succesData = [];
		const employeeId = [];
		try {
			await Promise.all(
				dataJson.map(async (data) => {
					let isExist = await EmployeeSegment.findOne({
						where: {
							segmentId: +data?.oldSegmentId,
							subSegmentId: data?.subSegmentId ? data?.subSegmentId : null,
						},
						include: [
							{
								model: Employee,
								required: true,
								where: {
									oldEmployeeId: data?.oldEmployeeId,
								},
							},
						],
					});
					isExist = parse(isExist);
					if (isExist) {
						await EmployeeSegment?.update({ rollover: true }, { where: { id: isExist?.id } });
						succesData.push({ ...isExist });
						employeeId.push(isExist?.employeeId);
					} else {
						errorData.push({ ...data });
					}
					// }
				}),
			);
			console.log({ succesData }, succesData?.length);
			console.log({ errorData }, errorData?.length);
			employeeId?.map((e) => {
				console.log(e);
			});
		} catch (error) {
			console.log({ error });
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Rollout updated Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
