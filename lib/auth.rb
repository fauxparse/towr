module Auth
  def self.methods
    @methods ||= []
  end
  
  Dir[File.join(Rails.root, "lib/auth/*.rb")].each do |f|
    method = File.basename(f, ".rb")
    methods << method.to_sym
    autoload method.camelize.to_sym, f
  end
  
  def self.[](method)
    const_get method.to_s.camelize.to_sym
  end
  
end
