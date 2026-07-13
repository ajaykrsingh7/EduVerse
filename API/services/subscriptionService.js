const subDAL  = require('../dal/supscriptionDAL');
const miscDAL = require('../dal/miscDAL');

const getMySubscription = (userId) => subDAL.getActiveSubscription(userId);

const getMyHistory = (userId) => subDAL.getSubscriptionHistory(userId);

const purchasePlan = async (userId, planId) => {
  const plan = await miscDAL.getPlanById(planId);
  if (!plan) throw Object.assign(new Error('Plan not found'), { statusCode: 404 });

  // Deactivate old subscriptions
  await subDAL.deactivatePreviousSubscriptions(userId);

  // Expires in 30 days (1 month subscription)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const id = await subDAL.createSubscription(userId, planId, expiresAt);
  return { subscriptionId: id, plan: plan.name, expiresAt };
};

module.exports = { getMySubscription, getMyHistory, purchasePlan };