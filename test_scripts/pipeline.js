module.exports = ({ route, exec, log }) => {
  return route
    .settings({
      sendLogs: true
    })
    .param('outcome', {
      options: ['success', 'failure']
    })
    .onCall(async (options) => {
      const outcome = options.outcome.value;

      log.info(`Starting pipeline with outcome ${outcome}`);

      await exec(outcome === 'success' ? 'echo "success" && exit 0' : 'echo "failure" && exit 1')
    })
}