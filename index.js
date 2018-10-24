#!/usr/bin/env node

const axios = require('axios');

const args = process.argv.slice(2);
const flags = args.filter(arg => arg.startsWith('--'));
const authToken = args.find(arg => arg.startsWith('xoxp'));

const slackApi = `https://slack.com/api`;
const rate = 1500;

let userId = null;
let totalCount = 0;
let idsToDelete = [];
let totalDeleted = 0;

function getUserId() {
	console.log('Retrieving user id...');
	axios.get(`${slackApi}/auth.test?token=${authToken}&pretty=1`)
		.then(({data}) => {
			if (data.error) {
				console.log('Could not find a user for the provided token.');
				return;
			}
			userId = data.user_id;
			console.log('Found user id...');
			requestList();
		})
}

getUserId();

function requestList() {
	console.log('Getting list of files created by user...');
	axios.get(`${slackApi}/files.list?token=${authToken}&count=100&user=${userId}&pretty=1`)
		.then(({data}) => {
			if (data.error) {
				console.log('Deletion terminated. Failed to retrieve a list of files. Reason:', data.error);
				return;
			}

			idsToDelete = data.files.map(file => file.id);
			totalCount = idsToDelete.length;

			console.log(`Total files to delete: ${totalCount}`);

			if (data.paging.pages > 1) {
				console.log('There are multiple pages of files to delete. Rerun this command after this session completes.');
			}

			if (totalCount > 0) {
				if (flags.includes('--dry')) {
					console.log('This was a dry run, remove the --dry flag to begin deleting files.');
				}
				else {
					setTimeout(deleteFile, rate);
				}
			}
		})
		.catch(error => console.log('There was an error retrieving the list of files. Reason:', error));
}


function deleteFile() {
	const fileId = idsToDelete.shift();

	axios.post(`${slackApi}/files.delete?token=${authToken}&file=${fileId}&pretty=1`)
		.then(({data}) => {
			if (data.error) {
				console.log('Deletion terminated. Failed to delete a file:', fileId, data.error);
				return;
			}

			console.log(`(${++totalDeleted}/${totalCount}) ${fileId} deleted`);

			if (idsToDelete.length) {
				setTimeout(deleteFile, rate);
			}
			else if (!idsToDelete.length && totalDeleted !== totalCount) {
				setTimeout(requestList, rate);
			}
			else if (totalDeleted === totalCount) {
				console.log('Deletions complete')
			}
		})
		.catch(error => console.log('Deletion terminated. There was a problem deleting a file', error));
}
