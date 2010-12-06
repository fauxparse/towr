require "digest/md5"

module UsersHelper
  def gravatar(user, options = {})
    options[:size] ||= 64
    options[:default] ||= :retro
    image_url = if user.email.present?
      "http#{"s" if options[:secure]}://www.gravatar.com/avatar/#{Digest::MD5.hexdigest user.email.downcase.strip}?" + options.except(:image).map { |k, v| "#{k.to_s[0,1]}=#{CGI.escape(v.to_s)}" }.join("&")
    else
      "http://placehold.it/#{size}x#{size}"
    end
    image_tag image_url, { :title => user.to_s }.merge(options[:image] || {})
  end
  
protected
  
end
