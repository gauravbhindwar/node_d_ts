import db from '@/models';
import EmployeeFile from '@/models/employeeFile.model';
import LoginUser from '@/models/loginUser.model';
import EmployeeRepo from '@/repository/employee.repository';
import UserRepo from '@/repository/user.repository';
import { parse } from '@/utils/common.util';

const userRepo = new UserRepo();
const employeeRepo = new EmployeeRepo();
(async function injectUsers(): Promise<void> {
	return db.transaction(async (transaction) => {
		// const result = await mssqldb.query('SELECT * FROM rd_EmployeeFile ref2 WHERE ref2.DeletedDate Is NOT NULL ');
		const result = [
			{
				Id: '60037124-56DA-460D-9433-01E81C9044C9',
				EmployeeId: '6B8C419E-999E-4013-9369-A435CB7750E1',
				Name: 'Contract_Korichi Abdelghani_30 Avril 2023',
				FileName: 'Contract_Korichi Abdelghani_30 Avril 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2022-11-08T16:01:33.940Z',
				StatusId: 1,
				DeletedDate: '2023-05-08T15:38:52.327Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: '5E85032D-DDFA-426B-A07D-0878982CF305',
				EmployeeId: '06B3EABF-2CFC-4C9D-B134-E966ABCEB14A',
				Name: 'Avenant_Rezzoug Chouaib_Chagement Position_Salaire',
				FileName: '43488192-febb-4c22-85c8-9bf2ae95884b-Avenant_Rezzoug Chouaib_Chagement Position_Salaire.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-16T14:21:33.887Z',
				StatusId: 1,
				DeletedDate: '2023-07-16T14:21:58.310Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: '3BB0EEF8-4F6A-42EF-A7D6-089CC1D7103D',
				EmployeeId: '14065BB1-2643-4149-BB71-ED6F8452FB49',
				Name: 'Contract_Doudi Yazid_30 Juin 2023',
				FileName: '17f31e73-77ad-4352-b423-1fed76c3f08a-Contract_Doudi Yazid_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-26T17:49:50.023Z',
				StatusId: 1,
				DeletedDate: '2023-07-31T11:01:12.077Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '7CA4CA0E-180F-44AA-8C87-0CA1F61C9072',
				EmployeeId: 'FF270984-BB38-4D2D-955E-C2FB1B26965D',
				Name: 'Contrat_Fekirine Mohammed Abdelhalim_21 January 2024',
				FileName: '13d5a24f-fbb1-4267-bf10-40043df29441-Contrat_Fekirine Mohammed Abdelhalim_21 January 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-26T17:43:45.517Z',
				StatusId: 1,
				DeletedDate: '2023-08-08T16:22:36.080Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: '6355B320-7FC5-4F42-B476-108668376236',
				EmployeeId: 'BDF648C4-438A-4074-848A-EAC0D63DC1C4',
				Name: 'Medical Check_Sayah Abdelkader_22 Mai 2024',
				FileName: 'fb57da8c-84dc-40ef-98bd-bc24861dd845-Medical Check_Sayah Abdelkader_22 Mai 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-05-30T15:46:00.157Z',
				StatusId: 1,
				DeletedDate: '2023-12-07T15:21:21.197Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'C96E4618-237C-48F9-9AA8-19969BAE50D3',
				EmployeeId: 'E0396D85-52F4-4EEB-9032-6EDE10886CBE',
				Name: 'Contrat_Zadi Nabil_29 Février 2024',
				FileName: 'fe9da428-883c-46da-8732-84e2f2b2d961-Contrat_Zadi Nabil_29 Février 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-08-28T14:55:21.840Z',
				StatusId: 1,
				DeletedDate: '2023-12-14T15:17:29.720Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'FF08BAFC-49B2-4A2F-8307-1BCC7F4B7AD1',
				EmployeeId: 'AF3D611E-AFB6-427A-A8B6-B86171D37FEA',
				Name: 'Contract_Taibi Amir_30 Avril 2024',
				FileName: '7438b011-a1a1-488a-9da7-8e282a56935c-Contract_Taibi Amir_30 Avril 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-10-26T15:27:40.863Z',
				StatusId: 1,
				DeletedDate: '2023-10-26T15:29:01.233Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '342A5EA9-CFC3-4F49-BCAB-2043FC564293',
				EmployeeId: 'A0873B08-8621-46A4-8A22-DC1DD0ED3F18',
				Name: 'Contract_Ziani Ahcene_31 Aout 2023',
				FileName: 'dc6e03a9-195d-4b44-9fb5-7147537a7c15-Contract_Ziani Ahcene_31 Aout 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-03-30T21:03:34.033Z',
				StatusId: 1,
				DeletedDate: '2023-03-30T21:04:43.520Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '82D7B8D1-508F-4D14-B89E-21E7AA2D42EF',
				EmployeeId: '8240A23A-2498-4E28-9B8C-FBF6ADBD840D',
				Name: 'Contract_Abed Ahmed_30 Juin 2023',
				FileName: 'd9362136-b8e0-499b-8744-683934b78edd-Contract_Abed Ahmed_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2022-12-22T15:25:47.217Z',
				StatusId: 1,
				DeletedDate: '2022-12-25T09:03:16.037Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'CA50CD42-075C-418E-BD96-3AF1D6C9ABA1',
				EmployeeId: '607F992D-20A3-4D68-B760-0009FF3C4D66',
				Name: 'Contrat_Touahir Aboudjihad_31 Decembre 2023',
				FileName: '06b129ce-8261-4fdd-9313-9a3552c31417-Contrat_Touahir Aboudjihad_31 Decembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-16T10:53:46.533Z',
				StatusId: 1,
				DeletedDate: '2023-07-26T17:45:55.910Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '0E415DE2-08BF-4D68-8CAC-55FDA3F884BD',
				EmployeeId: 'A0873B08-8621-46A4-8A22-DC1DD0ED3F18',
				Name: 'Avenant_Draredja Ilyas_30 Avril 2023',
				FileName: '21b7cbe6-4d0c-42f5-bbd4-2cff534aa886-Avenant_Draredja Ilyas_30 Avril 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-03-30T20:59:14.953Z',
				StatusId: 1,
				DeletedDate: '2023-03-30T20:59:37.440Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'EA95D780-2C90-47A0-92F2-5A3BE7AF298A',
				EmployeeId: '7F111DD1-095A-4551-BB1B-FC31B07AF1CC',
				Name: 'Contract_Fereka Brahim_31 Decembre 2023',
				FileName: '7f495fd5-ee13-4e93-888e-ab7b6b9fe399-Contract_Fereka Brahim_31 Decembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-20T09:35:53.440Z',
				StatusId: 1,
				DeletedDate: '2023-07-20T09:38:59.430Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '1EC6ABDC-22A9-431E-B6F9-634C93CC0AC5',
				EmployeeId: '750FCF2F-68DC-4F59-AFE3-4512B422CC9F',
				Name: 'Contrat_Nouioua Mustapha_31 Décembre 2023',
				FileName: '8a3728f7-9e85-495a-94e5-ac2ba74a4d28-Contrat_Nouioua Mustapha_31 Décembre 20232.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-16T11:05:27.840Z',
				StatusId: 1,
				DeletedDate: '2023-07-26T08:40:30.333Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'D6318437-D742-40CF-AE53-6D4F3E70542F',
				EmployeeId: 'CED09C27-DEA4-49FC-A339-6BE439BB69A6',
				Name: '20230724165234',
				FileName: '94ceca4e-68b6-4ca8-839c-2c7bc60d5930-20230724165234.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-24T15:46:42.423Z',
				StatusId: 1,
				DeletedDate: '2023-10-08T14:50:03.883Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'BF96FAF9-7AF4-47F8-BCCC-70BE0A4C3F07',
				EmployeeId: '4182E172-70FB-44FD-9F92-2DBE819AE1BB',
				Name: 'Contract_Rabahi Samir_31 Janvier 2024',
				FileName: '0339792b-c4da-402d-972d-90d90e5b4d3e-Contract_Rabahi Samir_31 Janvier 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-11-08T11:04:02.613Z',
				StatusId: 1,
				DeletedDate: '2023-11-08T11:04:17.597Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'FF85AA2F-B802-445E-99F2-72DC8CAC1587',
				EmployeeId: '8F883DBF-EE0F-4C1E-8BED-F732B7C3B3DF',
				Name: 'Medical Check-Madoui Abdelmoumen_17 Octobre 2024',
				FileName: '3f60760f-5d45-46bb-893d-4a993f0fb666-Medical Check-Madoui Abdelmoumen_17 Octobre 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-10-19T15:42:00.463Z',
				StatusId: 1,
				DeletedDate: '2023-10-19T15:42:52.613Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '6A5869C0-DF20-4088-B868-773D7FBEEF52',
				EmployeeId: '4E222DDD-E204-4A34-B0D4-35652714D362',
				Name: 'Contrat_Lali Nacer_21 Juillet 2023',
				FileName: 'db4bb34e-f9a4-4c39-8161-134a74a42f55-Contrat_Lali Nacer_21 Juillet 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-01-29T11:07:46.900Z',
				StatusId: 1,
				DeletedDate: '2023-01-29T11:11:56.557Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: '1EFD8381-5038-4E64-A6C0-7969BB242D82',
				EmployeeId: '4D68C26B-F304-4977-9828-A8197FF83C79',
				Name: 'Contract_Maamra Djafer_31 Decembre 2023',
				FileName: '32faabf3-8e59-4906-9a0f-04e90e4aa233-Contract_Maamra Djafer_31 Decembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-04-20T12:07:04.823Z',
				StatusId: 1,
				DeletedDate: '2023-07-25T18:34:26.953Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '2CCADBAD-2E82-40A5-AF81-7B10F8F39752',
				EmployeeId: '51FBC905-8D80-4782-99A7-6C45C4EAF9E7',
				Name: 'Contract_Nouar Okba_30 Juin 2023',
				FileName: '41f62363-0c68-4083-9f44-caaf9a4b0fce-Contract_Nouar Okba_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-02-19T15:58:13.717Z',
				StatusId: 1,
				DeletedDate: '2023-03-12T15:58:51.803Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'DA9DEEA5-75BD-41A4-89CC-7D6623D0ABD4',
				EmployeeId: '51FBC905-8D80-4782-99A7-6C45C4EAF9E7',
				Name: 'Contract_Nouar Okba_30 Juin 2023',
				FileName: '104ff67d-d449-43a0-b510-913c019c6ac1-Contract_Nouar Okba_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-02-16T20:30:39.653Z',
				StatusId: 1,
				DeletedDate: '2023-02-19T15:57:59.023Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '17E411E8-E3AC-4468-8842-7E70F51FCBEC',
				EmployeeId: 'FE101742-8C1A-449C-ABFE-FD2AEB6A7AF1',
				Name: 'Contrat_Ghomari Ilyes_30 Avril 2023',
				FileName: 'e5a6de59-59f3-44f5-aa9d-225acfcd2265-Contrat_Ghomari Ilyes_30 Avril 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-02-12T13:38:04.747Z',
				StatusId: 1,
				DeletedDate: '2023-02-12T13:42:37.350Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: 'F525F740-3DAB-496F-B28E-81806586A82E',
				EmployeeId: '8A1F3909-4E81-493E-BFC0-83F45EFB7577',
				Name: 'SECU_Boussaidi Maamar',
				FileName: 'f1a6bb27-f887-4908-bcf6-edb52bbd524c-SECU_Boussaidi Maamar.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-08-17T15:55:07.923Z',
				StatusId: 1,
				DeletedDate: '2023-11-30T12:34:56.030Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '2385DF0E-C0A9-41CC-B357-87AAA75E9A81',
				EmployeeId: '465449D4-B7D0-4FBB-ACB1-EBDB671CD52E',
				Name: 'Medical Check_Soufi Moussa_01 Janvier 2024',
				FileName: 'c465f586-ae1a-4b6d-a4e1-3951eebf8880-Medical Check_Soufi Moussa_01 Janvier 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-01-03T20:12:50.760Z',
				StatusId: 1,
				DeletedDate: '2023-01-03T20:13:33.137Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '2653EA58-43B0-4846-8740-907FB611F32A',
				EmployeeId: '249EEAD1-1B1D-4FDF-B528-AD01D562EF55',
				Name: 'Contract_Boussoualim Ahmed Abdelmoumen_30 Avril 2023',
				FileName: '23d8a4f7-3ea2-41ae-a014-e231472e5a89-Contract_Boussoualim Ahmed Abdelmoumen_30 Avril 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2022-11-30T15:54:30.490Z',
				StatusId: 1,
				DeletedDate: '2023-04-13T21:02:22.413Z',
				DeletedUserName: 'hr.manager@lred.com',
			},
			{
				Id: 'C4A25B19-A92A-49DD-B0D5-956A66B42690',
				EmployeeId: '10D8E53F-850B-4242-9812-E3AA506BC4C3',
				Name: 'Contract_Behloul Benaissa_25 Septembre 2023',
				FileName: '28291ddd-1af2-48ba-82dd-9f4dada381e9-Contract_Behloul Benaissa_25 Septembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-04-09T13:54:07.563Z',
				StatusId: 1,
				DeletedDate: '2023-10-11T08:02:54.087Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '50C33C67-215A-4909-AEC2-9A72ABC0BE63',
				EmployeeId: '4E222DDD-E204-4A34-B0D4-35652714D362',
				Name: 'Contract_Lali Nacereddine_ 21 January 2024',
				FileName: '87f72be0-4007-40cb-ba46-8f5d429977e9-Contract_Lali Nacereddine_ 21 January 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-25T17:33:54.143Z',
				StatusId: 1,
				DeletedDate: '2023-07-31T08:14:00.297Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: 'C5411600-68FC-46C5-A478-A15FECC18798',
				EmployeeId: 'FF270984-BB38-4D2D-955E-C2FB1B26965D',
				Name: 'Contrat_Fekirine Mohammed Abdelhalim_31 Décembre 2023',
				FileName: 'f8a32472-192f-4ac6-a855-c68a99286d54-Contrat_Fekirine Mohammed Abdelhalim_31 Décembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-08-03T15:42:48.650Z',
				StatusId: 1,
				DeletedDate: '2023-08-03T15:43:28.257Z',
				DeletedUserName: 'mounia@lred.com',
			},
			{
				Id: '0ABB6836-87FC-4A7C-B579-A41E0CC87AAF',
				EmployeeId: '73E0F6D6-E0A2-429C-9904-18A944F58910',
				Name: 'Contract_Boussaid Abdelouahed_31 Octobre 2023',
				FileName: 'fc1d53ac-f384-496a-941d-92a1e90b32b9-Contract_Boussaid Abdelouahed_31 Octobre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-04-17T13:19:32.480Z',
				StatusId: 1,
				DeletedDate: '2023-04-17T13:19:59.780Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '54A27890-78D7-4845-B2AB-B4551AE10096',
				EmployeeId: '8D66A552-A999-4CC2-8CA3-6A1DFA8D3474',
				Name: 'Contract_Athmani Antara_30 Juin 2024',
				FileName: '07c96a9c-4a9e-4bc8-b3cf-064e179bf9d6-Contract_Athmani Antara_30 Juin 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-12-14T15:36:46.853Z',
				StatusId: 1,
				DeletedDate: '2023-12-14T15:37:42.360Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '06633C54-6B49-4110-892F-C4326374D07A',
				EmployeeId: '930E9A74-D4BE-43DA-B227-C144AD256CBB',
				Name: 'Medical Check_Belkat Billel_09 Janvier 2024',
				FileName: 'a849f9e5-5526-4067-9e71-54b3aae972df-Medical Check_Belkat Billel_09 Janvier 2024.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-01-11T16:28:25.357Z',
				StatusId: 1,
				DeletedDate: '2023-01-11T16:28:35.537Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'C3FFF47A-F9BB-4A77-ABFE-D3B5B90D1FE1',
				EmployeeId: '07342FCA-E209-4596-856F-CA47E1266B44',
				Name: 'Contract_Achiou Adnane_30 Juin 2023',
				FileName: '5918aa1d-0dd5-47c6-9067-e01031dd864e-Contract_Achiou Adnane_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2022-12-21T16:15:13.803Z',
				StatusId: 1,
				DeletedDate: '2022-12-22T15:10:23.343Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '79ED9B08-2574-49D1-A8BF-DC44CD417B6B',
				EmployeeId: 'B4508C76-3DF2-46BC-AD33-A897E6B2E598',
				Name: 'Contract_Ahfaid Haitham_30 Juin 2023',
				FileName: '3d0f0583-820c-4bfe-9ad5-8ce20337c5fe-Contract_Ahfaid Haitham_30 Juin 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-07T10:47:57.610Z',
				StatusId: 1,
				DeletedDate: '2023-07-07T10:48:25.900Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '44A1599A-4955-4E5D-9248-DD5AD36863AE',
				EmployeeId: 'D807335B-B9D3-43D1-957C-F8C129E2612B',
				Name: 'Contrat_Boussaha Riadh_31 Juillet 2023',
				FileName: '54e23bd6-8cc3-41fa-8455-3d16244aef32-Contrat_Boussaha Riadh_31 Juillet 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-02-08T15:09:29.967Z',
				StatusId: 1,
				DeletedDate: '2023-05-18T10:10:17.360Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '0D91A5EA-C18E-4E65-A84F-E94F8CC48BDD',
				EmployeeId: 'C62B6D43-A471-4083-BA1F-F9D8A1EE40B2',
				Name: 'Contract_El Hanni Hamza_31 Octobre 2023',
				FileName: '0ab11e0a-d5ed-4506-b342-214c0cca7bbd-Contract_El Hanni Hamza_31 Octobre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-04-20T07:59:05.510Z',
				StatusId: 1,
				DeletedDate: '2023-05-18T10:14:49.697Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: '4EA0E380-C5FA-47CD-A31A-F4424C07A37E',
				EmployeeId: '8D66A552-A999-4CC2-8CA3-6A1DFA8D3474',
				Name: 'Contrat_Benamar Mohamed El Amine_31 Decembre 2023',
				FileName: 'cc323bb9-e8bc-4475-a448-dce956717c57-Contrat_Benamar Mohamed El Amine_31 Decembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-20T09:26:43.650Z',
				StatusId: 1,
				DeletedDate: '2023-07-26T17:47:11.823Z',
				DeletedUserName: 'admin@lred.com',
			},
			{
				Id: 'F6028DD6-15CB-44AF-8F88-F517507E5367',
				EmployeeId: '41D87710-31CF-4853-A41E-A9EC3AC05A67',
				Name: 'Contrat_Ababsa Bilal_31 Décembre 2023',
				FileName: 'be289934-d6e5-4c58-92e0-f5f35471fa48-Contrat_Ababsa Bilal_31 Décembre 2023.pdf',
				FolderId: '64C511C6-C842-42ED-B895-38E262FE6F37',
				UploadDate: '2023-07-16T15:16:48.633Z',
				StatusId: 1,
				DeletedDate: '2023-07-18T14:21:07.813Z',
				DeletedUserName: 'admin@lred.com',
			},
		];

		const userArr = new Map();
		const empArr = new Map();

		if (result.length) {
			for (const data of result as any) {
				if (data.DeletedUserName && !userArr.get(data.DeletedUserName)) {
					const userData = await userRepo
						.get({
							include: [{ model: LoginUser, required: true, where: { email: data.DeletedUserName } }],
						})
						.then((parserData) => parse(parserData));
					userArr.set(data.DeletedUserName, userData);
				}

				if (data.EmployeeId && !empArr.get(data.EmployeeId)) {
					const empData = await employeeRepo
						.get({ attributes: ['id', 'clientId', 'startDate'], where: { oldEmployeeId: data.EmployeeId } })
						.then((parserData) => parse(parserData));
					empArr.set(data.EmployeeId, empData);
				}

				await EmployeeFile.update(
					{
						employeeId: data?.EmployeeId ? empArr.get(data?.EmployeeId)?.id : null,
						deletedAt: data.DeletedDate ? data.DeletedDate : null,
						updatedBy: data?.DeletedUserName ? Number(userArr.get(data?.DeletedUserName)?.id) : null,
						updatedAt: data.DeletedDate ? data.DeletedDate : null,
					},
					{
						where: {
							employeeId: data?.EmployeeId ? empArr.get(data?.EmployeeId)?.id : null,
						},
						transaction,
					},
				);
			}
		}
	});
})()
	.then(async () => {
		// eslint-disable-next-line no-console
		console.log('Employee Deleted Data Added Successfully....');
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.log('info', err.message);
	});
