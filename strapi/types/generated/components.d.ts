import type { Schema, Struct } from '@strapi/strapi';

export interface DataVehicleWheelFitment extends Struct.ComponentSchema {
  collectionName: 'components_data_vehicle_wheel_fitments';
  info: {
    description: 'An OEM wheel and tyre specification for one axle or both axles';
    displayName: 'Vehicle Wheel Fitment';
  };
  attributes: {
    axle: Schema.Attribute.Enumeration<['both', 'front', 'rear']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'both'>;
    isOem: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    notes: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 300;
      }>;
    offset: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: -100;
        },
        number
      >;
    setupName: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 100;
      }>;
    tyreAspectRatio: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 20;
        },
        number
      >;
    tyreLoadIndex: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 150;
          min: 50;
        },
        number
      >;
    tyreSpeedRating: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 5;
      }>;
    tyreWidth: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 500;
          min: 100;
        },
        number
      >;
    wheelDiameter: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 30;
          min: 10;
        },
        number
      >;
    wheelWidth: Schema.Attribute.Decimal &
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
      'data.vehicle-wheel-fitment': DataVehicleWheelFitment;
      'data.wheel-models': DataWheelModels;
      'data.wheel-specifications': DataWheelSpecifications;
    }
  }
}
