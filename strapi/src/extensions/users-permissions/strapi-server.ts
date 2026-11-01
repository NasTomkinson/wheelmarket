type UsersPermissionsPlugin = {
  contentTypes: {
    user: {
      schema: {
        attributes: Record<string, unknown>;
      };
    };
  };
};

export default (plugin: UsersPermissionsPlugin) => {
  plugin.contentTypes.user.schema.attributes.location = {
    type: "string",
    minLength: 2,
    maxLength: 120,
  };

  return plugin;
};
