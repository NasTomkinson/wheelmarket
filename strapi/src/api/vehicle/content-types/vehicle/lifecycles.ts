import { errors } from '@strapi/utils';

const { ApplicationError } = errors;

type VehicleYears = {
  yearFrom?: number;
  yearTo?: number;
};

const validateYearRange = ({ yearFrom, yearTo }: VehicleYears) => {
  if (yearFrom !== undefined && yearTo !== undefined && yearTo < yearFrom) {
    throw new ApplicationError('Year To must be the same as or later than Year From.');
  }
};

export default {
  beforeCreate(event: { params: { data: VehicleYears } }) {
    validateYearRange(event.params.data);
  },

  async beforeUpdate(event: {
    params: {
      data: VehicleYears;
      where: Record<string, unknown>;
    };
  }) {
    const current = await strapi.db.query('api::vehicle.vehicle').findOne({
      where: event.params.where,
      select: ['yearFrom', 'yearTo'],
    });

    validateYearRange({
      yearFrom: event.params.data.yearFrom ?? current?.yearFrom,
      yearTo: event.params.data.yearTo ?? current?.yearTo,
    });
  },
};
