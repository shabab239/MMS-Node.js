export class ApiResponse {
    message?: string;
    data?: { [key: string]: any } = {};
    errors?: { [key: string]: string } = {};
    successful: boolean = false;

    constructor(successful?: boolean, message?: string) {
        if (successful !== undefined) {
            this.successful = successful;
        }
        if (message) {
            this.message = message;
        }
    }

    getData(key: string): any | null {
        return this.data ? this.data[key] : null;
    }

    setData(key: string, value: any): void {
        if (!this.data) {
            this.data = {};
        }
        this.data[key] = value;
    }

    success(message: string): ApiResponse {
        this.successful = true;
        this.message = message;
        return this;
    }

    error(message: string): ApiResponse {
        this.successful = false;
        this.message = message;
        return this;
    }

    errorFromException(e: any): ApiResponse {
        this.successful = false;
        try {
            this.message = e.cause?.cause?.message || e.cause?.message || e.message;
        } catch {
            this.message = e.message;
        }
        return this;
    }
}
