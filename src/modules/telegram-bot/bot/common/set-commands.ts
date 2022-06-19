export const setCommands = async (telegram, i18n, lang) => {
  await telegram.setMyCommands([
    {
      command: '/respawn',
      description: await i18n.t('telegram.COMMAND_RESPAWN', { lang }),
    },
    {
      command: '/subscriptions',
      description: await i18n.t('telegram.COMMAND_SUBSCRIPTIONS', { lang }),
    },
    // {
    //   command: '/donate',
    //   description: await i18n.t('telegram.COMMAND_DONATE', { lang }),
    // },
    {
      command: '/settings',
      description: await i18n.t('telegram.COMMAND_SETTINGS', { lang }),
    },
  ]);
};
