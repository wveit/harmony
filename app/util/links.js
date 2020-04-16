const { awsDefaultRegion } = require('./env');

/**
 * Returns a link to the cloud-access JSON endpoint
 *
 * @param {String} urlRoot The harmony root URL
 * @returns {Object} the link to the cloud-access JSON endpoint
 */
function getCloudAccessJsonLink(urlRoot) {
  return {
    title: `Access keys for s3:// URLs, usable from AWS ${awsDefaultRegion} (JSON format)`,
    href: `${urlRoot}/cloud-access`,
    rel: 'cloud-access-json',
    type: 'application/json',
  };
}

/**
 * Returns a link to the cloud-access shell script endpoint
 *
 * @param {String} urlRoot The harmony root URL
 * @returns {Object} the link to the cloud-access shell script endpoint
 */
function getCloudAccessShLink(urlRoot) {
  return {
    title: `Access keys for s3:// URLs, usable from AWS ${awsDefaultRegion} (Shell format)`,
    href: `${urlRoot}/cloud-access.sh`,
    rel: 'cloud-access-sh',
    type: 'application/x-sh',
  };
}

module.exports = { getCloudAccessJsonLink, getCloudAccessShLink };