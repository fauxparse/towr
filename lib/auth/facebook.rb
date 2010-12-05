module Auth
  class Facebook
    attr_accessor :controller
    
    delegate :params, :login_callback_url, :to => :controller
    
    def initialize(controller)
      @controller = controller
    end
    
    def client
      @client ||= OAuth2::Client.new(ENV['FACEBOOK_KEY'], ENV['FACEBOOK_SECRET'], { :site => "https://graph.facebook.com" })
    end
    
    def authentication_url
      client.web_server.authorize_url(  
        :redirect_uri => login_callback_url(:facebook),
        :scope => 'email,offline_access,user_photos,publish_stream'  
      )
    end
    
    def login
      begin
        access_token = client.web_server.get_access_token(params[:code], :redirect_uri => login_callback_url(:facebook))
        user_info = JSON.parse(access_token.get('/me'))
        User::Facebook[user_info].user
      rescue OAuth2::HTTPError => e
        return false
      end
    end
    
  end
end