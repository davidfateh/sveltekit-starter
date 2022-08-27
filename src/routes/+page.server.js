import { env } from '$env/dynamic/private';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';

const { CONTENTFUL_SPACE_ID, CONTENTFUL_ACCESS_TOKEN } = env;

console.log(
	`https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE_ID}/explore?access_token=${CONTENTFUL_ACCESS_TOKEN}`
);

const query = `
{
	employeeCollection{
    items{
      name,
      jobTitle
      startDate
      photo {
        url
        description
      }
    }
  }
}
`;

export async function load() {
	const url = 'https://graphql.contentful.com/content/v1/spaces/' + CONTENTFUL_SPACE_ID;

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: 'Bearer ' + CONTENTFUL_ACCESS_TOKEN
		},
		body: JSON.stringify({ query })
	});

	if (response.ok) {
		const { data } = await response.json();
		const { items } = data.employeeCollection;

		return {
			employees: items.map((e) => {
				const options = { month: 'long', year: 'numeric' };
				const date = new Date(e.startDate);
				const formattedStartDate = new Intl.DateTimeFormat('en-US', options).format(date);

				return {
					...e,
					startDate: formattedStartDate
				};
			})
		};
	}

	return {
		status: 404,
		errors: {
			message: 'Cannot Connect to the API'
		}
	};
}