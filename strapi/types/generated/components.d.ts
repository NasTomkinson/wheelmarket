import type { Schema, Struct } from '@strapi/strapi';

export interface DataWheelModels extends Struct.ComponentSchema {
  collectionName: 'components_data_wheel_models';
  info: {
    displayName: 'WheelModels';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

export interface DataWheelSpecifications extends Struct.ComponentSchema {
  collectionName: 'components_data_wheel_specifications';
  info: {
    displayName: 'WheelSpecifications';
  };
  attributes: {
    centreBore: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 150;
          min: 30;
        },
        number
      >;
    construction: Schema.Attribute.Enumeration<
      ['cast', 'flow_formed', 'forged']
    > &
      Schema.Attribute.Required;
    diameter: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 10;
        },
        number
      >;
    offset: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: -100;
        },
        number
      >;
    pcd_bolt_pattern: Schema.Attribute.Relation<
      'oneToOne',
      'api::pcd-bolt-pattern.pcd-bolt-pattern'
    > &
      Schema.Attribute.Required;
    width: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 3;
        },
        number
      >;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'data.wheel-models': DataWheelModels;
      'data.wheel-specifications': DataWheelSpecifications;
    }
  }
}
