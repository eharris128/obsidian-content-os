import { requestUrl, RequestUrlResponse } from 'obsidian';

export interface LinkedInPost {
	author: string;
	lifecycleState: 'PUBLISHED' | 'DRAFT';
	visibility: 'PUBLIC' | 'CONNECTIONS' | 'LOGGED_IN';
	commentary: string;
	distribution: {
		feedDistribution: 'MAIN_FEED' | 'NONE';
		targetEntities: string[];
		thirdPartyDistributionChannels: string[];
	};
}

export class LinkedInAPI {
  private accessToken: string;
  private readonly API_VERSION = '202506';
  private readonly BASE_URL = 'https://api.linkedin.com/v2';
  private personUrn: string | null = null;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async createPost(commentary: string): Promise<RequestUrlResponse> {
    if (!this.personUrn) {
      throw new Error('Person URN not available. Please validate token first.');
    }

    const post: LinkedInPost = {
      author: `urn:li:person:${this.personUrn}`,
      lifecycleState: 'PUBLISHED',
      visibility: 'PUBLIC',
      commentary,
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      }
    };

    const response = await requestUrl({
      url: `${this.BASE_URL}/posts`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'LinkedIn-Version': this.API_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });

    return response;
  }

  async getUserInfo(): Promise<RequestUrlResponse> {
    const response = await requestUrl({
      url: `${this.BASE_URL}/userinfo`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'LinkedIn-Version': this.API_VERSION
      }
    });

    if (response.status === 200 && response.json.sub) {
      this.personUrn = `urn:li:person:${response.json.sub}`;
    }

    return response;
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await this.getUserInfo();

      this.setPersonUrn(response.json.sub);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  updateAccessToken(newToken: string) {
    this.accessToken = newToken;
    this.personUrn = null;
  }

  getPersonUrn(): string | null {
    console.log("personUrn", this.personUrn);
    return this.personUrn;
  }

  setPersonUrn(personUrn: string) {
    this.personUrn = personUrn;
    console.log("set personUrn", this.personUrn);
  }
}
