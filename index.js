#!/usr/bin/env node

const axios = require('axios');

const args = process.argv.slice(2);

const slackApi = `https://slack.com/api`;
const rate = 1500;
const [authToken, userId] = args;

let totalCount = 0;
let idsToDelete = [];
let totalDeleted = 0;

requestList();

function requestList() {
	axios.get(`${slackApi}/files.list?token=${authToken}&count=100&user=${userId}&pretty=1`)
		.then(({data}) => {
			if (data.error) {
				console.log('Deletion terminated. Failed to retrieve a list of files. Reason:', data.error);
				return;
			}

			idsToDelete = data.files.map(file => file.id);
			totalCount = data.paging.total;

			console.log(`Total files to delete: ${totalCount}`);

			if (totalCount) {
				setTimeout(deleteFile, rate);
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
