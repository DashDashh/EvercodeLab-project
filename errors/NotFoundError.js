const BaseError = require("./BaseError");

//Ошибка "не найдено"
class NotFoundError extends BaseError {
  constructor(resourceType, resourceId = null, context = {}) {
    const message = resourceId
      ? `${resourceType} with id "${resourceId}" not found`
      : `${resourceType} not found`;

    super(message, 404, {
      ...context,
      resourceType,
      resourceId,
    });

    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }

  getResourceInfo() {
    return {
      type: this.resourceType,
      id: this.resourceId,
      timestamp: this.timestamp,
    };
  }

  getClientResponse() {
    return {
      ...super.getClientResponse(),
      resourceType: this.resourceType,
      ...(this.resourceId && { resourceId: this.resourceId }),
    };
  }
}

module.exports = NotFoundError;
